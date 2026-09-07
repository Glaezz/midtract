import { expect } from "chai";
import hre from "hardhat";

// Hardhat 3: tidak ada lagi `ethers` global. Koneksi network dibuat eksplisit
// di sini (simulasi lokal), dipakai bersama di semua describe/it di bawah.
const { ethers } = await hre.network.create();

describe("Midtract", function () {
  let midtract, token, owner, relayer, poolWallet, buyer, seller, other;
  const ONE_USDC = 1_000_000n; // mUSDC pakai 6 desimal, sama seperti USDC asli

  const ORDER_ID_1 = ethers.keccak256(ethers.toUtf8Bytes("RKB-TEST-001"));
  const ORDER_ID_2 = ethers.keccak256(ethers.toUtf8Bytes("RKB-TEST-002"));

  // OrderState enum di kontrak: NONE=0, LOCKED=1, RELEASED=2, REFUNDED=3
  const STATE = { NONE: 0, LOCKED: 1, RELEASED: 2, REFUNDED: 3 };

  async function latestTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return BigInt(block.timestamp);
  }

  async function signPermit(ownerSigner, spender, value, deadline) {
    const nonce = await token.nonces(ownerSigner.address);
    const { chainId } = await ethers.provider.getNetwork();
    const domain = {
      name: await token.name(),
      version: "1",
      chainId,
      verifyingContract: await token.getAddress(),
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const message = { owner: ownerSigner.address, spender, value, nonce, deadline };
    const signature = await ownerSigner.signTypedData(domain, types, message);
    return ethers.Signature.from(signature);
  }

  async function signLockOrder(signer, orderId, buyerAddr, sellerAddr, amount, deadline) {
    const nonce = await midtract.nonces(buyerAddr);
    const { chainId } = await ethers.provider.getNetwork();
    const domain = { name: "Midtract", version: "1", chainId, verifyingContract: await midtract.getAddress() };
    const types = {
      LockOrder: [
        { name: "orderId", type: "bytes32" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const message = { orderId, buyer: buyerAddr, seller: sellerAddr, amount, nonce, deadline };
    return signer.signTypedData(domain, types, message);
  }

  async function lockOrder(orderId, amount) {
    await token.connect(buyer).approve(await midtract.getAddress(), ethers.MaxUint256);
    const deadline = (await latestTimestamp()) + 900n;
    const sig = await signLockOrder(buyer, orderId, buyer.address, seller.address, amount, deadline);
    await midtract.connect(relayer).lockFunds(orderId, buyer.address, seller.address, amount, deadline, sig);
  }

  beforeEach(async function () {
    [owner, relayer, poolWallet, buyer, seller, other] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockUSDCPermit");
    token = await MockToken.deploy();
    await token.waitForDeployment();

    const Midtract = await ethers.getContractFactory("Midtract");
    midtract = await Midtract.connect(owner).deploy(await token.getAddress(), relayer.address, poolWallet.address);
    await midtract.waitForDeployment();

    await token.mint(buyer.address, 1000n * ONE_USDC);
  });

  // ============================================================
  describe("Deployment", function () {
    it("set alamat stablecoin, relayer, dan poolWallet dengan benar", async function () {
      expect(await midtract.stablecoin()).to.equal(await token.getAddress());
      expect(await midtract.relayer()).to.equal(relayer.address);
      expect(await midtract.poolWallet()).to.equal(poolWallet.address);
    });

    it("owner deployer otomatis jadi pemilik kontrak", async function () {
      expect(await midtract.owner()).to.equal(owner.address);
    });

    it("revert Midtract__InvalidStablecoin kalau alamat token zero address", async function () {
      const Midtract = await ethers.getContractFactory("Midtract");
      await expect(
        Midtract.deploy(ethers.ZeroAddress, relayer.address, poolWallet.address)
      ).to.be.revertedWithCustomError(Midtract, "Midtract__InvalidStablecoin");
    });

    it("revert Midtract__InvalidRelayer kalau alamat relayer zero address", async function () {
      const Midtract = await ethers.getContractFactory("Midtract");
      await expect(
        Midtract.deploy(await token.getAddress(), ethers.ZeroAddress, poolWallet.address)
      ).to.be.revertedWithCustomError(Midtract, "Midtract__InvalidRelayer");
    });

    it("revert Midtract__InvalidPoolWallet kalau alamat poolWallet zero address", async function () {
      const Midtract = await ethers.getContractFactory("Midtract");
      await expect(
        Midtract.deploy(await token.getAddress(), relayer.address, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(Midtract, "Midtract__InvalidPoolWallet");
    });
  });

  // ============================================================
  describe("onboardWithPermit", function () {
    it("berhasil approve allowance lewat signature permit user (gasless untuk user)", async function () {
      const deadline = (await latestTimestamp()) + 3600n;
      const value = ethers.MaxUint256;
      const sig = await signPermit(buyer, await midtract.getAddress(), value, deadline);

      await midtract.connect(relayer).onboardWithPermit(buyer.address, value, deadline, sig.v, sig.r, sig.s);

      expect(await token.allowance(buyer.address, await midtract.getAddress())).to.equal(value);
    });

    it("revert Midtract__NotRelayer kalau dipanggil bukan oleh relayer", async function () {
      const deadline = (await latestTimestamp()) + 3600n;
      const value = ethers.MaxUint256;
      const sig = await signPermit(buyer, await midtract.getAddress(), value, deadline);

      await expect(
        midtract.connect(other).onboardWithPermit(buyer.address, value, deadline, sig.v, sig.r, sig.s)
      )
        .to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer")
        .withArgs(other.address);
    });

    it("revert ERC2612ExpiredSignature (dari TOKEN) kalau signature permit sudah kedaluwarsa", async function () {
      const deadline = (await latestTimestamp()) - 10n;
      const value = ethers.MaxUint256;
      const sig = await signPermit(buyer, await midtract.getAddress(), value, deadline);

      await expect(
        midtract.connect(relayer).onboardWithPermit(buyer.address, value, deadline, sig.v, sig.r, sig.s)
      ).to.be.revertedWithCustomError(token, "ERC2612ExpiredSignature");
    });

    it("revert ERC2612InvalidSigner (dari TOKEN) kalau signature tidak cocok dengan owner yang diklaim", async function () {
      const deadline = (await latestTimestamp()) + 3600n;
      const value = ethers.MaxUint256;
      // buyer yang sign, tapi dipanggil mengatasnamakan 'other' -> signature mismatch
      const sig = await signPermit(buyer, await midtract.getAddress(), value, deadline);

      await expect(
        midtract.connect(relayer).onboardWithPermit(other.address, value, deadline, sig.v, sig.r, sig.s)
      ).to.be.revertedWithCustomError(token, "ERC2612InvalidSigner");
    });
  });

  // ============================================================
  describe("lockFunds", function () {
    const amount = 100n * ONE_USDC;
    let deadline;

    beforeEach(async function () {
      await token.connect(buyer).approve(await midtract.getAddress(), ethers.MaxUint256);
      deadline = (await latestTimestamp()) + 900n;
    });

    it("berhasil mengunci dana ketika signature buyer valid", async function () {
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, sig)
      )
        .to.emit(midtract, "Locked")
        .withArgs(ORDER_ID_1, buyer.address, seller.address, amount);

      const order = await midtract.getOrder(ORDER_ID_1);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.seller).to.equal(seller.address);
      expect(order.amount).to.equal(amount);
      expect(order.state).to.equal(STATE.LOCKED);

      expect(await token.balanceOf(await midtract.getAddress())).to.equal(amount);
      expect(await midtract.nonces(buyer.address)).to.equal(1n);
    });

    it("revert Midtract__NotRelayer kalau dipanggil bukan oleh relayer", async function () {
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);
      await expect(
        midtract.connect(other).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, sig)
      )
        .to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer")
        .withArgs(other.address);
    });

    it("revert Midtract__SignatureExpired kalau deadline sudah lewat", async function () {
      const expiredDeadline = (await latestTimestamp()) - 10n;
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, expiredDeadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, expiredDeadline, sig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__SignatureExpired");
    });

    it("revert Midtract__InvalidBuyerSignature kalau signature ditandatangani orang lain (bukan buyer)", async function () {
      const wrongSig = await signLockOrder(other, ORDER_ID_1, buyer.address, seller.address, amount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, wrongSig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__InvalidBuyerSignature");
    });

    it("revert Midtract__InvalidBuyerSignature kalau parameter di-tamper (nominal diubah)", async function () {
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);
      const tamperedAmount = amount * 2n;

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, tamperedAmount, deadline, sig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__InvalidBuyerSignature");
    });

    it("revert Midtract__InvalidBuyerSignature kalau orderId di-tamper (dipakai untuk order lain)", async function () {
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_2, buyer.address, seller.address, amount, deadline, sig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__InvalidBuyerSignature");
    });

    it("revert Midtract__BuyerSellerMustDiffer kalau buyer sama dengan seller", async function () {
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, buyer.address, amount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, buyer.address, amount, deadline, sig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__BuyerSellerMustDiffer");
    });

    it("revert Midtract__OrderAlreadyExists kalau orderId sudah pernah dipakai", async function () {
      await lockOrder(ORDER_ID_1, amount);

      const sig2 = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);
      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, sig2)
      )
        .to.be.revertedWithCustomError(midtract, "Midtract__OrderAlreadyExists")
        .withArgs(ORDER_ID_1);
    });

    it("revert ERC20InsufficientAllowance (dari TOKEN) kalau buyer belum approve", async function () {
      await token.connect(buyer).approve(await midtract.getAddress(), 0);
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, sig)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("revert ERC20InsufficientBalance (dari TOKEN) kalau saldo buyer tidak cukup", async function () {
      const hugeAmount = 10000n * ONE_USDC; // lebih dari saldo buyer (1000 mUSDC)
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, hugeAmount, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, hugeAmount, deadline, sig)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("mencegah replay attack -- signature lama tidak valid lagi untuk order baru setelah nonce naik", async function () {
      const sig1 = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, amount, deadline);
      await midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, amount, deadline, sig1);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_2, buyer.address, seller.address, amount, deadline, sig1)
      ).to.be.revertedWithCustomError(midtract, "Midtract__InvalidBuyerSignature");
    });

    it("nonce bertambah berurutan untuk lock ke-2, ke-3, dst dari buyer yang sama", async function () {
      await lockOrder(ORDER_ID_1, amount);
      expect(await midtract.nonces(buyer.address)).to.equal(1n);

      const ORDER_ID_3 = ethers.keccak256(ethers.toUtf8Bytes("RKB-TEST-003"));
      await token.mint(buyer.address, 1000n * ONE_USDC);
      const deadline2 = (await latestTimestamp()) + 900n;
      const sig2 = await signLockOrder(buyer, ORDER_ID_3, buyer.address, seller.address, amount, deadline2);
      await midtract.connect(relayer).lockFunds(ORDER_ID_3, buyer.address, seller.address, amount, deadline2, sig2);

      expect(await midtract.nonces(buyer.address)).to.equal(2n);
    });
  });

  // ============================================================
  describe("releaseFunds", function () {
    const amount = 100n * ONE_USDC;

    it("berhasil melepas dana ke penjual TANPA perlu signature penjual", async function () {
      await lockOrder(ORDER_ID_1, amount);

      await expect(midtract.connect(relayer).releaseFunds(ORDER_ID_1))
        .to.emit(midtract, "Released")
        .withArgs(ORDER_ID_1, seller.address, amount);

      expect(await token.balanceOf(seller.address)).to.equal(amount);
      expect(await token.balanceOf(await midtract.getAddress())).to.equal(0n);

      const order = await midtract.getOrder(ORDER_ID_1);
      expect(order.state).to.equal(STATE.RELEASED);
    });

    it("revert Midtract__NotRelayer kalau dipanggil bukan oleh relayer", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await expect(midtract.connect(other).releaseFunds(ORDER_ID_1))
        .to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer")
        .withArgs(other.address);
    });

    it("revert Midtract__OrderNotLocked kalau order belum pernah dikunci", async function () {
      await expect(midtract.connect(relayer).releaseFunds(ORDER_ID_1))
        .to.be.revertedWithCustomError(midtract, "Midtract__OrderNotLocked")
        .withArgs(ORDER_ID_1);
    });

    it("revert Midtract__OrderNotLocked kalau order sudah pernah dirilis (double release)", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await midtract.connect(relayer).releaseFunds(ORDER_ID_1);

      await expect(midtract.connect(relayer).releaseFunds(ORDER_ID_1)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__OrderNotLocked"
      );
    });

    it("revert Midtract__OrderNotLocked kalau order sudah di-refund sebelumnya", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await midtract.connect(relayer).refundFunds(ORDER_ID_1);

      await expect(midtract.connect(relayer).releaseFunds(ORDER_ID_1)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__OrderNotLocked"
      );
    });
  });

  // ============================================================
  describe("refundFunds", function () {
    const amount = 100n * ONE_USDC;

    it("berhasil mengembalikan dana ke pembeli TANPA perlu signature tambahan", async function () {
      await lockOrder(ORDER_ID_1, amount);
      const balanceBefore = await token.balanceOf(buyer.address);

      await expect(midtract.connect(relayer).refundFunds(ORDER_ID_1))
        .to.emit(midtract, "Refunded")
        .withArgs(ORDER_ID_1, buyer.address, amount);

      expect(await token.balanceOf(buyer.address)).to.equal(balanceBefore + amount);

      const order = await midtract.getOrder(ORDER_ID_1);
      expect(order.state).to.equal(STATE.REFUNDED);
    });

    it("revert Midtract__NotRelayer kalau dipanggil bukan oleh relayer", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await expect(midtract.connect(other).refundFunds(ORDER_ID_1))
        .to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer")
        .withArgs(other.address);
    });

    it("revert Midtract__OrderNotLocked kalau order belum pernah dikunci", async function () {
      await expect(midtract.connect(relayer).refundFunds(ORDER_ID_1)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__OrderNotLocked"
      );
    });

    it("revert Midtract__OrderNotLocked kalau order sudah pernah di-refund (double refund)", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await midtract.connect(relayer).refundFunds(ORDER_ID_1);

      await expect(midtract.connect(relayer).refundFunds(ORDER_ID_1)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__OrderNotLocked"
      );
    });

    it("revert Midtract__OrderNotLocked kalau order sudah dirilis ke penjual sebelumnya", async function () {
      await lockOrder(ORDER_ID_1, amount);
      await midtract.connect(relayer).releaseFunds(ORDER_ID_1);

      await expect(midtract.connect(relayer).refundFunds(ORDER_ID_1)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__OrderNotLocked"
      );
    });
  });

  // ============================================================
  describe("sweep", function () {
    const amount = 50n * ONE_USDC;

    beforeEach(async function () {
      await token.mint(seller.address, 200n * ONE_USDC);
      await token.connect(seller).approve(await midtract.getAddress(), ethers.MaxUint256);
    });

    it("berhasil menarik token dari wallet user ke pool wallet", async function () {
      await expect(midtract.connect(relayer).sweep(seller.address, amount))
        .to.emit(midtract, "Swept")
        .withArgs(seller.address, amount);

      expect(await token.balanceOf(poolWallet.address)).to.equal(amount);
    });

    it("revert Midtract__NotRelayer kalau dipanggil bukan oleh relayer", async function () {
      await expect(midtract.connect(other).sweep(seller.address, amount))
        .to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer")
        .withArgs(other.address);
    });

    it("revert ERC20InsufficientAllowance (dari TOKEN) kalau allowance tidak cukup", async function () {
      await token.connect(seller).approve(await midtract.getAddress(), 0);
      await expect(midtract.connect(relayer).sweep(seller.address, amount)).to.be.revertedWithCustomError(
        token,
        "ERC20InsufficientAllowance"
      );
    });

    it("revert ERC20InsufficientBalance (dari TOKEN) kalau saldo user tidak cukup walau allowance unlimited", async function () {
      const tooMuch = 10000n * ONE_USDC;
      await expect(midtract.connect(relayer).sweep(seller.address, tooMuch)).to.be.revertedWithCustomError(
        token,
        "ERC20InsufficientBalance"
      );
    });

    it("bisa dipakai untuk sweep dana refund dari wallet buyer juga (bukan cuma seller)", async function () {
      await lockOrder(ORDER_ID_1, 100n * ONE_USDC);
      await midtract.connect(relayer).refundFunds(ORDER_ID_1);
      await expect(midtract.connect(relayer).sweep(buyer.address, 100n * ONE_USDC))
        .to.emit(midtract, "Swept")
        .withArgs(buyer.address, 100n * ONE_USDC);
    });
  });

  // ============================================================
  describe("Admin -- setRelayer & setPoolWallet", function () {
    it("owner bisa update relayer", async function () {
      await expect(midtract.connect(owner).setRelayer(other.address))
        .to.emit(midtract, "RelayerUpdated")
        .withArgs(other.address);
      expect(await midtract.relayer()).to.equal(other.address);
    });

    it("revert OwnableUnauthorizedAccount kalau setRelayer bukan dari owner", async function () {
      await expect(midtract.connect(other).setRelayer(other.address))
        .to.be.revertedWithCustomError(midtract, "OwnableUnauthorizedAccount")
        .withArgs(other.address);
    });

    it("revert Midtract__InvalidRelayer dengan zero address", async function () {
      await expect(midtract.connect(owner).setRelayer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__InvalidRelayer"
      );
    });

    it("relayer LAMA tidak bisa lagi eksekusi transaksi setelah diganti admin", async function () {
      await midtract.connect(owner).setRelayer(other.address);

      await token.connect(buyer).approve(await midtract.getAddress(), ethers.MaxUint256);
      const deadline = (await latestTimestamp()) + 900n;
      const sig = await signLockOrder(buyer, ORDER_ID_1, buyer.address, seller.address, 100n * ONE_USDC, deadline);

      await expect(
        midtract.connect(relayer).lockFunds(ORDER_ID_1, buyer.address, seller.address, 100n * ONE_USDC, deadline, sig)
      ).to.be.revertedWithCustomError(midtract, "Midtract__NotRelayer");

      await expect(
        midtract.connect(other).lockFunds(ORDER_ID_1, buyer.address, seller.address, 100n * ONE_USDC, deadline, sig)
      ).to.emit(midtract, "Locked");
    });

    it("owner bisa update poolWallet", async function () {
      await expect(midtract.connect(owner).setPoolWallet(other.address))
        .to.emit(midtract, "PoolWalletUpdated")
        .withArgs(other.address);
      expect(await midtract.poolWallet()).to.equal(other.address);
    });

    it("revert OwnableUnauthorizedAccount kalau setPoolWallet bukan dari owner", async function () {
      await expect(midtract.connect(other).setPoolWallet(other.address))
        .to.be.revertedWithCustomError(midtract, "OwnableUnauthorizedAccount")
        .withArgs(other.address);
    });

    it("revert Midtract__InvalidPoolWallet dengan zero address", async function () {
      await expect(midtract.connect(owner).setPoolWallet(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        midtract,
        "Midtract__InvalidPoolWallet"
      );
    });
  });

  // ============================================================
  describe("getOrder", function () {
    it("mengembalikan order kosong (state NONE) untuk orderId yang belum pernah dipakai", async function () {
      const order = await midtract.getOrder(ORDER_ID_1);
      expect(order.state).to.equal(STATE.NONE);
      expect(order.buyer).to.equal(ethers.ZeroAddress);
      expect(order.seller).to.equal(ethers.ZeroAddress);
      expect(order.amount).to.equal(0n);
    });

    it("mengembalikan data yang benar setelah order dikunci", async function () {
      const amount = 75n * ONE_USDC;
      await lockOrder(ORDER_ID_1, amount);

      const order = await midtract.getOrder(ORDER_ID_1);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.seller).to.equal(seller.address);
      expect(order.amount).to.equal(amount);
      expect(order.state).to.equal(STATE.LOCKED);
    });
  });
});
