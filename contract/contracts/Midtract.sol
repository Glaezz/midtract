//SPDX-License-Identifier: BSL-1.1
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Midtract
/// @notice Kontrak escrow untuk Rekber Web2.5.
///         Menggabungkan fungsi escrow (lock/release/refund) DAN fungsi
///         forwarder/sweep dalam satu kontrak, supaya user cuma perlu
///         approve/permit SATU alamat kontrak saat onboarding.
///
/// Ringkasan aturan sign:
///  - LOCK   : WAJIB signature buyer, per transaksi (EIP-712, via Privy)
///  - RELEASE: TIDAK butuh signature siapa pun (dieksekusi relayer)
///  - REFUND : TIDAK butuh signature siapa pun (dieksekusi relayer)
///  - SWEEP  : TIDAK butuh signature per transaksi -- pakai allowance
///             yang di-approve/permit SEKALI saat onboarding
contract Midtract is EIP712, Ownable {
    using ECDSA for bytes32;

    IERC20 public immutable stablecoin;
    address public relayer;
    address public poolWallet;

    enum OrderState {
        NONE,
        LOCKED,
        RELEASED,
        REFUNDED
    }

    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        OrderState state;
    }

    mapping(bytes32 => Order) public orders;
    mapping(address => uint256) public nonces;

    bytes32 private constant LOCK_TYPEHASH =
        keccak256(
            "LockOrder(bytes32 orderId,address buyer,address seller,uint256 amount,uint256 nonce,uint256 deadline)"
        );

    event Locked(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    event Released(
        bytes32 indexed orderId,
        address indexed seller,
        uint256 amount
    );
    event Refunded(
        bytes32 indexed orderId,
        address indexed buyer,
        uint256 amount
    );
    event Swept(address indexed from, uint256 amount);
    event RelayerUpdated(address indexed newRelayer);
    event PoolWalletUpdated(address indexed newPoolWallet);

    // ============================================================
    // CUSTOM ERRORS -- pengganti require(condition, "string"),
    // lebih hemat gas dan konsisten dengan pola OpenZeppelin v5.
    // Prefix "Midtract__" memudahkan frontend membedakan error dari
    // kontrak ini vs error dari token (ERC20InsufficientAllowance, dst).
    // ============================================================
    error Midtract__NotRelayer(address caller);
    error Midtract__InvalidStablecoin();
    error Midtract__InvalidRelayer();
    error Midtract__InvalidPoolWallet();
    error Midtract__SignatureExpired();
    error Midtract__OrderAlreadyExists(bytes32 orderId);
    error Midtract__BuyerSellerMustDiffer();
    error Midtract__InvalidBuyerSignature();
    error Midtract__TransferFromFailed();
    error Midtract__OrderNotLocked(bytes32 orderId);
    error Midtract__TransferToSellerFailed();
    error Midtract__TransferToBuyerFailed();
    error Midtract__SweepFailed();

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert Midtract__NotRelayer(msg.sender);
        _;
    }

    constructor(
        address _stablecoin,
        address _relayer,
        address _poolWallet
    ) EIP712("Midtract", "1") Ownable(msg.sender) {
        if (_stablecoin == address(0)) revert Midtract__InvalidStablecoin();
        if (_relayer == address(0)) revert Midtract__InvalidRelayer();
        if (_poolWallet == address(0)) revert Midtract__InvalidPoolWallet();
        stablecoin = IERC20(_stablecoin);
        relayer = _relayer;
        poolWallet = _poolWallet;
    }

    // ============================================================
    // ONBOARDING
    // ============================================================

    function onboardWithPermit(
        address user,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyRelayer {
        // Kalau signature/deadline tidak valid, ini akan revert dengan
        // custom error DARI TOKEN (ERC2612ExpiredSignature / ERC2612InvalidSigner),
        // bukan dari Midtract -- itu wajar, errornya memang berasal dari sana.
        IERC20Permit(address(stablecoin)).permit(
            user,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );
    }

    // ============================================================
    // LOCK
    // ============================================================

    function lockFunds(
        bytes32 orderId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external onlyRelayer {
        if (block.timestamp > deadline) revert Midtract__SignatureExpired();
        if (orders[orderId].state != OrderState.NONE)
            revert Midtract__OrderAlreadyExists(orderId);
        if (buyer == seller) revert Midtract__BuyerSellerMustDiffer();

        uint256 nonce = nonces[buyer];
        bytes32 structHash = keccak256(
            abi.encode(
                LOCK_TYPEHASH,
                orderId,
                buyer,
                seller,
                amount,
                nonce,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        if (signer != buyer) revert Midtract__InvalidBuyerSignature();

        nonces[buyer] = nonce + 1;

        orders[orderId] = Order({
            buyer: buyer,
            seller: seller,
            amount: amount,
            state: OrderState.LOCKED
        });

        // Kalau allowance/saldo buyer tidak cukup, ini revert dengan custom error
        // DARI TOKEN (ERC20InsufficientAllowance / ERC20InsufficientBalance).
        if (!stablecoin.transferFrom(buyer, address(this), amount))
            revert Midtract__TransferFromFailed();

        emit Locked(orderId, buyer, seller, amount);
    }

    // ============================================================
    // RELEASE
    // ============================================================

    function releaseFunds(bytes32 orderId) external onlyRelayer {
        Order storage order = orders[orderId];
        if (order.state != OrderState.LOCKED)
            revert Midtract__OrderNotLocked(orderId);

        order.state = OrderState.RELEASED;
        if (!stablecoin.transfer(order.seller, order.amount))
            revert Midtract__TransferToSellerFailed();

        emit Released(orderId, order.seller, order.amount);
    }

    // ============================================================
    // REFUND
    // ============================================================

    function refundFunds(bytes32 orderId) external onlyRelayer {
        Order storage order = orders[orderId];
        if (order.state != OrderState.LOCKED)
            revert Midtract__OrderNotLocked(orderId);

        order.state = OrderState.REFUNDED;
        if (!stablecoin.transfer(order.buyer, order.amount))
            revert Midtract__TransferToBuyerFailed();

        emit Refunded(orderId, order.buyer, order.amount);
    }

    // ============================================================
    // SWEEP
    // ============================================================

    function sweep(address from, uint256 amount) external onlyRelayer {
        // Kalau allowance/saldo user tidak cukup, ini revert dengan custom error
        // DARI TOKEN (ERC20InsufficientAllowance / ERC20InsufficientBalance).
        if (!stablecoin.transferFrom(from, poolWallet, amount))
            revert Midtract__SweepFailed();
        emit Swept(from, amount);
    }

    // ============================================================
    // ADMIN
    // ============================================================

    function setRelayer(address _relayer) external onlyOwner {
        if (_relayer == address(0)) revert Midtract__InvalidRelayer();
        relayer = _relayer;
        emit RelayerUpdated(_relayer);
    }

    function setPoolWallet(address _poolWallet) external onlyOwner {
        if (_poolWallet == address(0)) revert Midtract__InvalidPoolWallet();
        poolWallet = _poolWallet;
        emit PoolWalletUpdated(_poolWallet);
    }

    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
}
