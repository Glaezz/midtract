import { keccak256, toUtf8Bytes } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, STABLECOIN_ADDRESS } from '$lib/config/constants/addresses';
import { injectiveEvmTestnet } from '$lib/config/chains';

/**
 * Potong string desimal ke maksimal 6 angka di belakang koma (ke bawah).
 * HARUS identik dengan toStablecoinUnits() di backend (ROUND_DOWN) -- nominal
 * ini ikut masuk digest EIP-712 lockFunds, kalau beda satu bit signature ditolak.
 */
export function truncateToStablecoinDecimals(value: string): string {
  const [int, frac = ''] = value.split('.');
  return frac.length <= 6 ? value : `${int}.${frac.slice(0, 6)}`;
}

export function buildPermitTypedData(owner: string, value: bigint, nonce: bigint, deadline: bigint) {
  return {
    domain: {
      name: 'USDC', // HARUS persis dengan name() token di testnet -- "USD Coin" akan bikin permit invalid
      version: '2',
      chainId: injectiveEvmTestnet.id,
      verifyingContract: STABLECOIN_ADDRESS,
    },
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit' as const,
    message: { owner, spender: ESCROW_CONTRACT_ADDRESS, value, nonce, deadline },
  };
}

export function buildLockOrderTypedData(orderCode: string, buyer: string, seller: string, amount: bigint, nonce: bigint, deadline: bigint) {
  const orderId = keccak256(toUtf8Bytes(orderCode));

  return {
    domain: {
      name: 'Midtract',
      version: '1',
      chainId: injectiveEvmTestnet.id,
      verifyingContract: ESCROW_CONTRACT_ADDRESS,
    },
    types: {
      LockOrder: [
        { name: 'orderId', type: 'bytes32' },
        { name: 'buyer', type: 'address' },
        { name: 'seller', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'LockOrder' as const,
    message: { orderId, buyer, seller, amount, nonce, deadline },
  };
}
