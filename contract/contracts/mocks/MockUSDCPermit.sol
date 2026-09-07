// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @notice Mock token HANYA untuk testing lokal (meniru USDC + EIP-2612 permit).
/// JANGAN dipakai di deployment testnet/mainnet asli — di sana pakai USDC resmi dari Circle.
contract MockUSDCPermit is ERC20, ERC20Permit {
    constructor() ERC20("Mock USD Coin", "mUSDC") ERC20Permit("Mock USD Coin") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
