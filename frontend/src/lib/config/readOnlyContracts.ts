import { ethers, keccak256, toUtf8Bytes, AbiCoder } from 'ethers';
import { injectiveEvmTestnet } from '$lib/config/chains';
import { ESCROW_CONTRACT_ADDRESS, STABLECOIN_ADDRESS } from '$lib/config/constants/addresses';
import MidtractAbi from '@shared/abi/Midtract.json';
import StablecoinPermitAbi from '@shared/abi/StablecoinPermit.json';

// Provider READ-ONLY -- tidak butuh private key, tidak butuh sign, tidak kena gas.
// Dipakai murni untuk baca state kontrak (nonce, dst) sebelum user diminta sign.
const readOnlyProvider = new ethers.JsonRpcProvider(injectiveEvmTestnet.rpcUrls.default.http[0]);

const escrowReadContract = new ethers.Contract(
  ESCROW_CONTRACT_ADDRESS,
  MidtractAbi, // shared/abi/Midtract.json adalah array ABI mentah (tanpa wrapper .abi)
  readOnlyProvider
);

const tokenReadContract = new ethers.Contract(
  STABLECOIN_ADDRESS,
  StablecoinPermitAbi, // ABI standar (tulisan tangan), bukan hasil compile -- tidak butuh .abi
  readOnlyProvider
);

/** Nonce untuk sign LockOrder (mapping `nonces` di Midtract.sol). */
export async function getLockNonce(walletAddress: string): Promise<bigint> {
  return escrowReadContract.nonces(walletAddress);
}

/** Nonce untuk sign Permit onboarding (mapping bawaan ERC20Permit di token). */
export async function getPermitNonce(walletAddress: string): Promise<bigint> {
  return tokenReadContract.nonces(walletAddress);
}

/** Allowance token yang sudah di-approve wallet ke Midtract -- dipakai deteksi "sudah onboarding belum". */
export async function getAllowance(walletAddress: string): Promise<bigint> {
  return tokenReadContract.allowance(walletAddress, ESCROW_CONTRACT_ADDRESS);
}

/**
 * Pre-flight check sebelum minta user sign permit: hitung DOMAIN_SEPARATOR
 * secara lokal (rumus persis library EIP712.sol milik USDC/Circle) lalu
 * bandingkan dengan nilai on-chain. Kalau beda, signature pasti invalid
 * ("EIP2612: invalid signature") -- lebih baik gagal CEPAT dengan pesan jelas
 * daripada user sign lalu tx relayer revert.
 */
export async function assertStablecoinDomainMatches(): Promise<void> {
  const [name, version, onChainDs] = await Promise.all([
    tokenReadContract.name() as Promise<string>,
    tokenReadContract.version() as Promise<string>,
    tokenReadContract.DOMAIN_SEPARATOR() as Promise<string>,
  ]);

  const domainTypehash = keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'));
  const expected = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [domainTypehash, keccak256(toUtf8Bytes(name)), keccak256(toUtf8Bytes(version)), BigInt(injectiveEvmTestnet.id), STABLECOIN_ADDRESS],
    ),
  );

  if (expected.toLowerCase() !== String(onChainDs).toLowerCase()) {
    throw new Error(
      `Domain EIP-712 stablecoin tidak cocok: name="${name}" version="${version}" chainId=${injectiveEvmTestnet.id} ` +
        `menghasilkan ${expected} tapi kontrak pakai ${onChainDs}. Perbaiki buildPermitTypedData.`,
    );
  }
}
