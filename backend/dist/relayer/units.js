import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';
/**
 * Konversi nilai Decimal dari DB (human-readable, mis. 5.61 USDC) ke satuan terkecil
 * (6 desimal) untuk dipanggil ke smart contract. SELALU pakai fungsi ini untuk
 * konversi ini -- jangan Number()/Math.round() manual, supaya konsisten dan tidak
 * kena floating-point error.
 */
export function toStablecoinUnits(amount) {
    // Kolom Decimal di DB bisa menyimpan sampai 30 desimal, sedangkan parseUnits
    // hanya menerima maksimal 6 (NUMERIC_FAULT "underflow" kalau lebih). Bulatkan
    // KE BAWAH supaya nilai ke kontrak tidak pernah melebihi nilai tersimpan.
    // FE punya logika pemotongan identik di eip712.ts -- jaga keduanya sinkron,
    // karena nominal ini ikut masuk digest signature lockFunds.
    const quantized = new Prisma.Decimal(amount.toString()).toDecimalPlaces(6, Prisma.Decimal.ROUND_DOWN);
    return ethers.parseUnits(quantized.toFixed(), 6);
}
/**
 * Kebalikannya -- dari satuan terkecil (bigint) balik ke angka desimal human-readable,
 * kalau suatu saat perlu (mis. baca event on-chain yang nilainya masih satuan terkecil).
 */
export function fromStablecoinUnits(amount) {
    return ethers.formatUnits(amount, 6);
}
