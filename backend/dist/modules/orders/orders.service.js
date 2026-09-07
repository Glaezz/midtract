import { db } from '../../db/client.js';
import { Prisma } from '@prisma/client';
import { lockFunds as relayerLockFunds } from '../../relayer/lockFunds.js';
import { releaseFunds as relayerReleaseFunds } from '../../relayer/releaseFunds.js';
import { fundBuyerWallet } from '../../relayer/fundBuyerWallet.js';
import { ensureOnboardedForSweep } from '../../relayer/allowance.js';
import { getUsdcToIdrRate } from '../rate/rate.service.js';
import { toStablecoinUnits } from '../../relayer/units.js';
import { getUserByPrivyDid } from '../users/users.service.js';
import { randomBytes } from 'node:crypto';
import { maskEmail, maskPhoneOrAccountNumber } from '../../utils/mask.js';
const LOCK_SIGNATURE_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const AUTO_RELEASE_WINDOW_MS = 4 * 24 * 60 * 60 * 1000; // 4 hari
/**
 * Token acak MURNI (32 byte random, bukan hash/encode dari orderCode atau id
 * mana pun) -- sengaja begini supaya tidak bisa "dipecahkan" atau ditebak dari
 * data yang publik. orderCode boleh setertebak apa pun (memang sengaja publik
 * untuk transparansi), tapi inviteToken ini yang jadi satu-satunya gerbang join.
 */
function generateInviteToken() {
    return randomBytes(24).toString('base64url');
}
export async function createOrder(input) {
    const seller = await getUserByPrivyDid(input.sellerPrivyDid);
    if (!seller) {
        throw new Error('User belum sync -- panggil POST /api/users/sync dulu sebelum bikin order');
    }
    const orderCode = `RKB-${Date.now()}`; // sesuaikan format sesuai kebutuhan
    const stablecoinRateUsed = await getUsdcToIdrRate();
    // Hitung pakai Decimal (bukan Number) supaya bebas floating-point error, lalu
    // simpan SUDAH dipotong ke 6 desimal -- konsisten dengan toStablecoinUnits()
    // yang dipakai relayer & signature lockFunds di frontend.
    const amountStablecoin = new Prisma.Decimal(String(input.amountIdr))
        .div(stablecoinRateUsed)
        .toDecimalPlaces(6, Prisma.Decimal.ROUND_DOWN);
    // Sweep ke pool setelah release butuh allowance penjual -- validasi SEBELUM
    // order dibuat supaya dana tidak pernah nyangkut di wallet yang tak terkendali.
    await ensureOnboardedForSweep(seller.walletAddress, amountStablecoin, 'Penjual');
    return db.order.create({
        data: {
            orderCode,
            inviteToken: generateInviteToken(),
            sellerId: seller.id,
            productName: input.productName,
            productDescription: input.productDescription,
            amountIdr: input.amountIdr,
            stablecoinRateUsed,
            amountStablecoin,
            sellerPayoutChannel: input.sellerPayoutChannel,
            sellerPayoutNumber: input.sellerPayoutNumber,
            status: 'PENDING_PAYMENT',
        },
    });
}
/**
 * Dipanggil halaman undangan (/rekber/i/:inviteToken) untuk resolve data order
 * SEBELUM login/join -- dipakai buat nampilin nama produk & nominal di halaman
 * undangan. Sengaja tidak mengembalikan data sensitif (nomor DANA penjual, dst).
 */
export async function getInviteDetails(inviteToken) {
    const order = await db.order.findUniqueOrThrow({
        where: { inviteToken },
        include: { seller: true },
    });
    return {
        orderCode: order.orderCode,
        productName: order.productName,
        productDescription: order.productDescription,
        amountIdr: order.amountIdr,
        status: order.status,
        canJoin: order.status === 'PENDING_PAYMENT' && !order.buyerId,
        sellerId: order.sellerId, // dipakai frontend buat deteksi "penjual sendiri yang buka link" -> redirect
    };
}
/**
 * Join lewat inviteToken (BUKAN orderCode) -- ini gerbang satu-satunya untuk
 * jadi pembeli. Logika validasinya sama seperti sebelumnya (status, buyerId
 * kosong, bukan penjual sendiri), cuma sumber lookup-nya diganti ke inviteToken.
 */
export async function joinOrderByInvite(inviteToken, buyerPrivyDid, buyerPayoutChannel, buyerPayoutNumber) {
    const order = await db.order.findUniqueOrThrow({ where: { inviteToken } });
    const buyer = await getUserByPrivyDid(buyerPrivyDid);
    if (!buyer) {
        throw new Error('User belum sync -- panggil POST /api/users/sync dulu sebelum join order');
    }
    if (buyer.id === order.sellerId) {
        throw new Error('Penjual tidak boleh jadi pembeli di rekber miliknya sendiri');
    }
    // Gerbang onboarding: setelah join, sistem akan top-up USDC ke wallet buyer
    // yang kelak HARUS bisa ditarik balik lewat sweep (butuh allowance onboarding).
    await ensureOnboardedForSweep(buyer.walletAddress, order.amountStablecoin, 'Pembeli');
    const result = await db.order.updateMany({
        where: { inviteToken, buyerId: null, status: 'PENDING_PAYMENT' },
        data: { buyerId: buyer.id, buyerPayoutChannel, buyerPayoutNumber },
    });
    if (result.count === 0) {
        throw new Error(`Order ini sudah punya pembeli atau statusnya bukan PENDING_PAYMENT`);
    }
    return db.order.findUniqueOrThrow({ where: { inviteToken } });
}
/**
 * Daftar order untuk halaman dashboard -- dipisah per peran (seller/buyer)
 * supaya frontend gampang render dua tab terpisah.
 */
export async function listOrdersForUser(privyDid, role) {
    const user = await getUserByPrivyDid(privyDid);
    if (!user) {
        throw new Error('User belum sync');
    }
    return db.order.findMany({
        where: role === 'seller' ? { sellerId: user.id } : { buyerId: user.id },
        orderBy: { createdAt: 'desc' },
    });
}
/**
 * Transaksi publik terbaru untuk live ticker di Landing page -- bagian dari
 * fitur transparansi. Cuma order yang statusnya sudah lanjut dari sekadar
 * "dibuat" (biar tidak nampilin rekber kosong yang belum ada aktivitas apa
 * pun), dan field yang dikembalikan sengaja terbatas + wallet address
 * ditampilkan utuh di sini (sensor sebagian dilakukan di FRONTEND saat
 * render, bukan di backend, supaya data mentahnya tetap satu sumber).
 */
export async function listRecentPublicOrders(limit = 10) {
    const orders = await db.order.findMany({
        where: { status: { not: 'PENDING_PAYMENT' } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: { seller: true, buyer: true },
    });
    return orders.map((order) => ({
        orderCode: order.orderCode,
        productName: order.productName,
        amountIdr: order.amountIdr,
        status: order.status,
        sellerWallet: order.seller.walletAddress,
        buyerWallet: order.buyer?.walletAddress ?? null,
        updatedAt: order.updatedAt,
    }));
}
/**
 * Dipanggil setelah webhook Midtrans sukses. Urutan SENGAJA begini: funding on-chain
 * dulu (tunggu sampai dikonfirmasi), BARU status order diubah ke WAITING_FOR_SIGNATURE.
 * Kalau dibalik, ada celah waktu status sudah "siap sign" di DB padahal USDC belum
 * benar-benar sampai di wallet buyer -- frontend yang polling status bisa nampilin
 * tombol sign lebih awal dari seharusnya.
 */
export async function markWaitingForSignature(orderCode) {
    // KLAIM ATOMIK: cuma satu pemanggil yang bisa lolos dari titik ini, walau
    // dipanggil bersamaan (retry webhook Midtrans, atau tombol simulasi demo
    // ke-klik dua kali). Tanpa ini, order yang statusnya sudah lanjut jauh
    // (bahkan sudah COMPLETED) bisa "ditarik mundur" paksa ke WAITING_FOR_SIGNATURE,
    // memicu ulang top-up dari pool -- yang ujungnya di-reclaim+refund lagi oleh
    // cron job 15 menit kemudian karena tidak ada yang sign ulang. Ini akar
    // masalah "riwayat top-up/reclaim/refund muncul lagi setelah selesai".
    const claimed = await db.order.updateMany({
        where: { orderCode, status: 'PENDING_PAYMENT' },
        data: { status: 'FUNDING_IN_PROGRESS' },
    });
    if (claimed.count === 0) {
        const current = await db.order.findUniqueOrThrow({ where: { orderCode } });
        console.warn(`[markWaitingForSignature] Order ${orderCode} sudah berstatus ${current.status}, ` +
            'notifikasi diabaikan (kemungkinan duplikat/retry).');
        return current;
    }
    await fundBuyerWallet(orderCode); // tunggu sampai tx top-up dikonfirmasi on-chain
    return db.order.update({
        where: { orderCode },
        data: {
            status: 'WAITING_FOR_SIGNATURE',
            signatureDeadlineAt: new Date(Date.now() + LOCK_SIGNATURE_WINDOW_MS),
        },
    });
}
/**
 * Dipanggil dari endpoint POST /api/orders/lock. Sengaja TIDAK percaya sellerWallet
 * dan amountStablecoin dari body request -- diambil dari order yang tersimpan di DB,
 * supaya tidak ada celah client mengirim nilai yang tidak konsisten dengan order aslinya.
 * Client cukup kirim orderCode, buyerWallet, deadline, dan signature.
 */
export async function confirmLock(orderCode, buyerWallet, deadline, signature) {
    const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { seller: true } });
    if (order.status !== 'WAITING_FOR_SIGNATURE') {
        throw new Error(`Order ${orderCode} berstatus ${order.status}, tidak bisa di-lock`);
    }
    const amountStablecoinUnits = toStablecoinUnits(order.amountStablecoin);
    return relayerLockFunds(orderCode, buyerWallet, order.seller.walletAddress, amountStablecoinUnits, deadline, signature);
}
/**
 * Detail satu order -- dipakai halaman detail rekber, PUBLIK (tanpa login).
 * inviteToken SENGAJA tidak diikutsertakan -- itu rahasia, cuma penjual yang
 * boleh tahu (lihat getInviteLinkForSeller). Kalau ini bocor ke publik, siapa
 * saja bisa langsung join tanpa lewat link undangan penjual.
 */
export async function getOrderDetail(orderCode) {
    const order = await db.order.findUniqueOrThrow({
        where: { orderCode },
        include: { seller: true, buyer: true },
    });
    const { inviteToken: _omit, ...publicOrder } = order;
    // Sensor data pribadi DI SINI (server), sebelum keluar dari backend -- endpoint
    // ini publik/tanpa login, jadi data mentahnya tidak boleh pernah terkirim sama sekali.
    return {
        ...publicOrder,
        seller: {
            name: order.seller.name,
            email: maskEmail(order.seller.email),
            phoneNumber: order.seller.phoneNumber ? maskPhoneOrAccountNumber(order.seller.phoneNumber) : null,
            walletAddress: order.seller.walletAddress,
        },
        buyer: order.buyer
            ? {
                name: order.buyer.name,
                email: maskEmail(order.buyer.email),
                phoneNumber: order.buyer.phoneNumber ? maskPhoneOrAccountNumber(order.buyer.phoneNumber) : null,
                walletAddress: order.buyer.walletAddress,
            }
            : null,
        sellerPayoutNumber: maskPhoneOrAccountNumber(order.sellerPayoutNumber),
        buyerPayoutNumber: order.buyerPayoutNumber ? maskPhoneOrAccountNumber(order.buyerPayoutNumber) : null,
    };
}
/** Ambil link undangan -- HANYA boleh diakses penjual pemilik order ini sendiri. */
export async function getInviteLinkForSeller(orderCode, sellerPrivyDid) {
    const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
    const seller = await getUserByPrivyDid(sellerPrivyDid);
    if (!seller || order.sellerId !== seller.id) {
        throw new Error('Cuma penjual pemilik order ini yang boleh lihat link undangan');
    }
    return { inviteToken: order.inviteToken };
}
const EXPLORER_URL = 'https://testnet.blockscout.injective.network';
function formatUsdcAmount(amount, rate) {
    return `${amount.toString()} USDC ($1 = Rp ${Number(rate).toLocaleString('id-ID')})`;
}
function formatIdrAmount(amountIdr) {
    return `Rp ${amountIdr.toLocaleString('id-ID')}`;
}
/**
 * Timeline publik: gabungan payments + onchainEvents + payouts + refunds, disusun
 * jadi narasi siap-tampil (judul, dari-ke, deskripsi, dst) -- BUKAN cuma data mentah.
 * Alasan disusun di backend (bukan frontend): semua konteks yang dibutuhkan buat
 * bikin narasinya (alamat kontrak, nama channel, rate saat itu) sudah ada di sini,
 * daripada duplikasi logic bisnis di dua sisi.
 *
 * CATATAN PENTING soal narasi "RELEASED": pelepasan dana di sistem kita dipicu
 * PEMBELI KONFIRMASI MANUAL atau AUTO-RELEASE TIMEOUT -- BUKAN oracle otomatis
 * yang memverifikasi resi kurir. Jangan pernah tulis "oracle" di deskripsi manapun,
 * itu tidak menggambarkan cara kerja sistem ini yang sebenarnya.
 */
export async function getOrderTimeline(orderCode) {
    const order = await db.order.findUniqueOrThrow({
        where: { orderCode },
        include: { seller: true, buyer: true },
    });
    const [payments, onchainEvents, payouts, refunds] = await Promise.all([
        db.payment.findMany({ where: { orderId: order.id } }),
        db.onchainEvent.findMany({ where: { orderId: order.id } }),
        db.payout.findMany({ where: { orderId: order.id } }),
        db.refund.findMany({ where: { orderId: order.id } }),
    ]);
    const timeline = [];
    for (const p of payments) {
        if (p.status !== 'SUCCESS')
            continue; // percobaan gagal tidak perlu masuk timeline publik
        timeline.push({
            entryType: 'PAYMENT',
            title: 'Pembayaran Pembeli',
            provider: p.provider === 'midtrans' ? 'Midtrans Snap (QRIS)' : 'Simulasi Demo',
            description: 'Pembeli melunasi tagihan QRIS. Setelah pembayaran terverifikasi, sistem melanjutkan ke proses berikutnya.',
            from: 'Pembeli (QRIS)',
            to: 'Pool Sistem',
            amountDisplay: formatIdrAmount(p.amountIdr),
            occurredAt: p.paidAt ?? p.createdAt,
            referenceLabel: 'ID Transaksi Midtrans:',
            referenceId: p.providerTransactionId ?? p.snapToken,
            txHash: null,
        });
    }
    const onchainMeta = {
        POOL_FUNDING: {
            title: 'Transfer USDC ke Wallet Pembeli',
            provider: 'Injective EVM Testnet',
            description: 'Sistem mentransfer USDC dari pool wallet ke wallet pembeli, sebagai representasi nilai transaksi yang akan dikunci ke smart contract.',
        },
        LOCKED: {
            title: 'Penguncian Dana (Lock Escrow)',
            provider: 'Midtract.sol (EIP-712)',
            description: 'Pembeli menandatangani persetujuan lewat Privy. Relayer mengeksekusi penguncian dana ke smart contract Midtract secara on-chain.',
        },
        RELEASED: {
            title: 'Pelepasan Dana ke Penjual',
            provider: 'Midtract.sol',
            description: 'Dana dilepaskan dari smart contract ke wallet penjual, dipicu konfirmasi "Barang Diterima" dari pembeli atau tenggat auto-release yang sudah terlampaui.',
        },
        REFUNDED_ONCHAIN: {
            title: 'Pengembalian Dana ke Pembeli',
            provider: 'Midtract.sol',
            description: 'Dana dikembalikan dari smart contract ke wallet pembeli, hasil pembatalan atau penyelesaian sengketa.',
        },
        SWEPT_TO_POOL: {
            title: 'Sweep ke Pool Wallet',
            provider: 'Midtract.sol',
            description: 'Sistem menarik kembali USDC ke pool wallet menggunakan izin (allowance) yang diberikan saat aktivasi akun -- tanpa perlu signature tambahan.',
        },
        RECLAIMED_TO_POOL: {
            title: 'Reclaim Top-up ke Pool',
            provider: 'Midtract.sol',
            description: 'USDC yang sebelumnya ditransfer ke wallet pembeli ditarik kembali ke pool karena transaksi tidak dilanjutkan sampai tenggat waktu.',
        },
    };
    for (const e of onchainEvents) {
        const meta = onchainMeta[e.eventType] ?? { title: e.eventType, provider: 'Injective EVM Testnet', description: '' };
        timeline.push({
            entryType: e.eventType,
            title: meta.title,
            provider: meta.provider,
            description: meta.description,
            from: e.fromAddress ?? '-',
            to: e.toAddress ?? '-',
            amountDisplay: formatUsdcAmount(e.amountStablecoin, order.stablecoinRateUsed),
            occurredAt: e.occurredAt,
            referenceLabel: null,
            referenceId: null,
            txHash: e.txHash,
        });
    }
    for (const p of payouts) {
        if (p.status !== 'SUCCESS')
            continue;
        timeline.push({
            entryType: 'PAYOUT_SELLER',
            title: 'Pencairan Saldo ke Penjual',
            provider: p.provider === 'okeconnect' ? 'Okeconnect Payout API' : 'Simulasi Demo',
            description: 'Setelah USDC diterima di pool wallet, sistem mencairkan dana ke akun e-wallet penjual.',
            from: 'Pool Sistem (Rupiah)',
            to: `${p.recipientChannel} (${maskPhoneOrAccountNumber(p.recipientNumber)})`,
            amountDisplay: formatIdrAmount(p.amountIdr),
            occurredAt: p.disbursedAt ?? p.createdAt,
            referenceLabel: 'SN Payout Okeconnect:',
            referenceId: p.providerPayoutId,
            txHash: null,
        });
    }
    for (const r of refunds) {
        if (r.status !== 'SUCCESS')
            continue;
        timeline.push({
            entryType: 'REFUND_BUYER',
            title: 'Pengembalian Dana ke Pembeli',
            provider: 'Okeconnect Payout API',
            description: 'Sistem mengembalikan dana ke akun e-wallet pembeli.',
            from: 'Pool Sistem (Rupiah)',
            to: `${r.recipientChannel} (${maskPhoneOrAccountNumber(r.recipientNumber)})`,
            amountDisplay: formatIdrAmount(r.amountIdr),
            occurredAt: r.refundedAt ?? r.createdAt,
            referenceLabel: 'Alasan:',
            referenceId: r.reason,
            txHash: null,
        });
    }
    timeline.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
    return timeline.map((entry) => ({
        ...entry,
        txHash: entry.txHash ? `${entry.txHash}` : null,
        explorerUrl: entry.txHash ? `${EXPLORER_URL}/tx/${entry.txHash}` : null,
    }));
}
/** Dipanggil saat penjual input resi -- TIDAK memicu pelepasan dana, cuma metadata + set auto_release_at */
export async function markInTransit(orderCode, courierName, courierReceiptNumber) {
    return db.order.update({
        where: { orderCode },
        data: {
            status: 'IN_TRANSIT',
            courierName,
            courierReceiptNumber,
            autoReleaseAt: new Date(Date.now() + AUTO_RELEASE_WINDOW_MS),
        },
    });
}
/** Dipanggil saat pembeli klik "Barang Diterima" */
export async function confirmDelivered(orderCode) {
    // KLAIM ATOMIK -- kalau tombol "Barang Diterima" ke-klik dua kali (double-click,
    // koneksi lambat lalu user klik ulang), cuma percobaan pertama yang lolos.
    // Tanpa ini, releaseFunds() bisa terpanggil 2x hampir bersamaan; kontrak
    // sendiri akan menolak percobaan kedua (Midtract__OrderNotLocked), tapi itu
    // baru ketahuan SETELAH buang gas + bikin log error yang membingungkan.
    const claimed = await db.order.updateMany({
        where: { orderCode, status: 'IN_TRANSIT' },
        data: { status: 'DELIVERED_CONFIRMED_BY_BUYER' },
    });
    if (claimed.count === 0) {
        const current = await db.order.findUniqueOrThrow({ where: { orderCode } });
        throw new Error(`Order ${orderCode} berstatus ${current.status}, tidak bisa dikonfirmasi diterima`);
    }
    return relayerReleaseFunds(orderCode);
}
/** Dipanggil pembeli klik "Ajukan Sengketa" -- membekukan auto-release */
export async function raiseDispute(orderCode, description) {
    // KLAIM ATOMIK -- pola yang sama seperti confirmDelivered/markWaitingForSignature.
    // Tanpa ini, order yang sudah COMPLETED/CANCELLED_REFUNDED pun bisa "diajukan
    // sengketa" lagi (statusFrom di order_logs jadi salah, dan resolveDispute nanti
    // akan gagal aneh di step on-chain karena state kontrak sudah tidak LOCKED).
    const claimed = await db.order.updateMany({
        where: { orderCode, status: 'IN_TRANSIT' },
        data: { status: 'DISPUTED' },
    });
    if (claimed.count === 0) {
        const current = await db.order.findUniqueOrThrow({ where: { orderCode } });
        throw new Error(`Order ${orderCode} berstatus ${current.status}, tidak bisa diajukan sengketa`);
    }
    const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
    await db.orderLog.create({
        data: { orderId: order.id, statusFrom: 'IN_TRANSIT', statusTo: 'DISPUTED', description },
    });
    return order;
}
