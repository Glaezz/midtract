import { ethers } from 'ethers';
import { escrowContract } from '../../relayer/contract.js';
import { getUserByPrivyDid, upsertUserFromPrivy } from '../users/users.service.js';

/**
 * Urutan SENGAJA begini: verifikasi identitas -> eksekusi on-chain -> BARU update
 * profil (nama/telepon). Kalau on-chain gagal, exception dilempar duluan dan baris
 * update profil di bawah tidak akan pernah kejalan -- supaya tidak ada data profil
 * "nyasar" tanpa allowance beneran aktif di blockchain.
 */
export async function onboardUser(
  privyDid: string,
  userAddress: string,
  value: bigint,
  deadline: bigint,
  signature: string,
  name?: string,
  phoneNumber?: string,
) {
  const user = await getUserByPrivyDid(privyDid);
  if (!user) {
    throw new Error('User belum sync -- panggil POST /api/users/sync dulu');
  }
  // Cegah user A mengaktifkan allowance mengatasnamakan address user B --
  // sebelumnya endpoint ini TIDAK PUNYA proteksi ini sama sekali.
  if (user.walletAddress.toLowerCase() !== userAddress.toLowerCase()) {
    throw new Error('Alamat wallet tidak cocok dengan user yang sedang login');
  }

  const { v, r, s } = ethers.Signature.from(signature);
  const tx = await escrowContract.onboardWithPermit(userAddress, value, deadline, v, r, s);
  const receipt = await tx.wait();

  await upsertUserFromPrivy({
    privyDid,
    email: user.email,
    walletAddress: user.walletAddress,
    name: name ?? user.name ?? undefined,
    phoneNumber: phoneNumber ?? user.phoneNumber ?? undefined,
  });

  return { txHash: receipt.hash };
}
