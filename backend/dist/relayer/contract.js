import { ethers } from 'ethers';
import { env } from '../config/env.js';
import { ERC20_MINIMAL_ABI } from './erc20Abi.js';
// ABI diambil dari folder shared (satu sumber, dipakai FE & BE) --
// generate ulang setelah `npm run build` di /contracts, lalu copy ke /shared/abi
import MidtractAbi from '../../../shared/abi/Midtract.json' with { type: 'json' };
export const provider = new ethers.JsonRpcProvider(env.chain.rpcUrl);
export const relayerWallet = new ethers.Wallet(env.relayerPrivateKey, provider);
export const escrowContract = new ethers.Contract(env.contracts.escrowAddress, MidtractAbi, relayerWallet);
// Signer TERPISAH untuk pool wallet -- HANYA dipakai untuk transfer token plain
// (top-up wallet buyer, reclaim). TIDAK PERNAH dipakai untuk memanggil fungsi
// Midtract (itu tugas relayerWallet). Private key-nya juga terpisah di .env --
// lihat catatan keamanan relayer vs pool wallet di dokumentasi.
export const poolWalletSigner = new ethers.Wallet(env.poolWalletPrivateKey, provider);
export const tokenContract = new ethers.Contract(env.contracts.stablecoinAddress, ERC20_MINIMAL_ABI, poolWalletSigner);
