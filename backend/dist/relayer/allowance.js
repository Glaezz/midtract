import { tokenContract } from './contract.js';
import { env } from '../config/env.js';
import { toStablecoinUnits } from './units.js';
/**
 * sweep() di kontrak Midtract menarik USDC dari wallet user lewat transferFrom --
 * itu hanya berhasil kalau user sudah pernah onboarding (sign permit yang memberi
 * allowance ke escrow contract). Tanpa pengecekan ini, dana top-up bisa nyangkut
 * selamanya di wallet user karena reclaim/release tidak punya izin menarik.
 */
export async function getAllowanceUnits(userWallet) {
    return (await tokenContract.allowance(userWallet, env.contracts.escrowAddress));
}
/**
 * Gerbang WAJIB sebelum sistem mengirim/menahan dana yang kelak harus ditarik
 * balik lewat sweep(): pastikan allowance user >= nominal yang terlibat.
 * Dipakai saat join order, create payment (sebelum QRIS diterbitkan), dan
 * sebelum fundBuyerWallet.
 */
export async function ensureOnboardedForSweep(userWallet, requiredStablecoin, roleLabel) {
    const needed = toStablecoinUnits(requiredStablecoin);
    const allowance = await getAllowanceUnits(userWallet);
    if (allowance < needed) {
        throw new Error(`${roleLabel} belum menyelesaikan onboarding/aktivasi akun ` +
            `(allowance ${allowance.toString()} < dibutuhkan ${needed.toString()}). ` +
            'Buka halaman Aktifkan Akun dan tanda tangani pesan permit terlebih dahulu.');
    }
}
