import { db } from '../../db/client.js';
/**
 * Dipanggil tiap kali user login lewat Privy di frontend. Kalau privyDid belum ada
 * di tabel users, buat baru; kalau sudah ada, update wallet_address/email (jaga-jaga
 * kalau ada perubahan dari sisi Privy).
 */
export async function upsertUserFromPrivy(input) {
    return db.user.upsert({
        where: { privyDid: input.privyDid },
        update: {
            email: input.email,
            walletAddress: input.walletAddress,
            ...(input.name ? { name: input.name } : {}),
            ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
        },
        create: {
            privyDid: input.privyDid,
            email: input.email,
            walletAddress: input.walletAddress,
            name: input.name,
            phoneNumber: input.phoneNumber,
        },
    });
}
export async function getUserByPrivyDid(privyDid) {
    return db.user.findUnique({ where: { privyDid } });
}
