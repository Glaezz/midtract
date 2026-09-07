import midtransClient from 'midtrans-client';
import { env } from '../../config/env.js';
import { db } from '../../db/client.js';
import { markWaitingForSignature } from '../orders/orders.service.js';
import { ensureOnboardedForSweep } from '../../relayer/allowance.js';
const isMockMode = !env.midtrans.serverKey;
const snap = isMockMode
    ? null
    : new midtransClient.Snap({
        isProduction: env.midtrans.isProduction,
        serverKey: env.midtrans.serverKey,
        clientKey: env.midtrans.clientKey,
    });
const PLATFORM_FEE_IDR = 1000n; // flat, sesuai PRD
const GATEWAY_FEE_RATE = 0.007; // 0,7% dari nominal produk
function calculateFees(amountIdr) {
    const platformFeeIdr = PLATFORM_FEE_IDR;
    const gatewayFeeIdr = BigInt(Math.round(Number(amountIdr) * GATEWAY_FEE_RATE));
    const totalIdr = amountIdr + platformFeeIdr + gatewayFeeIdr;
    return { platformFeeIdr, gatewayFeeIdr, totalIdr };
}
/**
 * Bikin transaksi Snap dengan 3 item terpisah (produk, biaya platform, biaya QRIS)
 * supaya rinciannya kelihatan jelas di pop-up Midtrans -- bukan cuma satu angka
 * bulat yang membingungkan pembeli. Dibatasi hanya QRIS (`other_qris`) sesuai
 * keputusan kalian, bukan semua metode pembayaran Snap yang tersedia.
 */
export async function createPayment(orderCode) {
    const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { buyer: true } });
    if (order.status !== 'PENDING_PAYMENT') {
        throw new Error(`Order ${orderCode} berstatus ${order.status}, tidak bisa dibuatkan pembayaran baru`);
    }
    if (!order.buyer) {
        throw new Error(`Order ${orderCode} belum punya pembeli, tidak bisa dibuatkan pembayaran`);
    }
    // GERBANG PENTING: cek allowance SEBELUM QRIS diterbitkan. Kalau dicek belakangan,
    // dana top-up yang sudah dikirim ke wallet buyer jadi mustahil ditarik balik
    // (sweep butuh allowance dari onboarding permit) -- USDC nyangkut selamanya.
    await ensureOnboardedForSweep(order.buyer.walletAddress, order.amountStablecoin, 'Pembeli');
    const existingPending = await db.payment.findFirst({
        where: { orderId: order.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
    });
    if (existingPending?.snapToken) {
        return { token: existingPending.snapToken, mockMode: isMockMode };
    }
    const { platformFeeIdr, gatewayFeeIdr, totalIdr } = calculateFees(order.amountIdr);
    if (isMockMode) {
        const mockToken = `MOCK-${Date.now()}`;
        await db.payment.create({
            data: {
                orderId: order.id,
                provider: 'mock',
                snapToken: mockToken,
                amountIdr: totalIdr,
                platformFeeIdr,
                gatewayFeeIdr,
                status: 'PENDING',
            },
        });
        return { token: mockToken, mockMode: true };
    }
    const transaction = await snap.createTransaction({
        transaction_details: { order_id: orderCode, gross_amount: Number(totalIdr) },
        item_details: [
            { id: 'PRODUCT', price: Number(order.amountIdr), quantity: 1, name: `Rekber #${order.orderCode}` },
            { id: 'PLATFORM_FEE', price: Number(platformFeeIdr), quantity: 1, name: 'Biaya Layanan Platform' },
            { id: 'GATEWAY_FEE', price: Number(gatewayFeeIdr), quantity: 1, name: 'Biaya Transaksi QRIS' },
        ],
        enabled_payments: ['other_qris'], // dibatasi cuma QRIS, bukan semua metode Snap
    });
    await db.payment.create({
        data: {
            orderId: order.id,
            provider: 'midtrans',
            snapToken: transaction.token,
            amountIdr: totalIdr,
            platformFeeIdr,
            gatewayFeeIdr,
            status: 'PENDING',
        },
    });
    return { token: transaction.token, mockMode: false };
}
/**
 * Verifikasi + parse notifikasi webhook lewat SDK resmi -- signature diverifikasi
 * OTOMATIS di dalam sini (throw kalau tidak valid).
 */
export async function handleMidtransNotification(rawBody) {
    if (isMockMode) {
        throw new Error('handleMidtransNotification tidak berlaku saat mock mode');
    }
    const statusResponse = await snap.transaction.notification(rawBody);
    const orderCode = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const transactionId = statusResponse.transaction_id;
    const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
    const pending = await db.payment.findFirst({
        where: { orderId: order.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
    });
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        if (pending) {
            await db.payment.update({
                where: { id: pending.id },
                data: { providerTransactionId: transactionId, status: 'SUCCESS', paidAt: new Date() },
            });
        }
        await markWaitingForSignature(orderCode);
        return;
    }
    // GAGAL/KADALUARSA -- SELURUH ORDER langsung dimatikan permanen di sini, bukan
    // cuma baris Payment-nya. Sengaja BUKAN dibuka lagi untuk percobaan bayar ulang:
    // kalau slot pembeli dibuka lagi, orang lain (atau yang sama, tidak serius) bisa
    // terus-terusan join-tidak bayar-expire tanpa batas, rekber jadi tidak pernah
    // benar-benar gagal. Solusinya: sekali gagal, order mati, penjual bikin baru.
    //
    // Aman dilakukan tanpa reclaim apa pun -- funding on-chain (fundBuyerWallet)
    // baru terjadi di markWaitingForSignature, yang HANYA dipanggil kalau
    // settlement/capture. expire/cancel/deny berarti itu belum pernah dipanggil,
    // jadi tidak ada USDC yang perlu ditarik balik di titik ini.
    if (transactionStatus === 'expire' || transactionStatus === 'cancel' || transactionStatus === 'deny') {
        if (pending) {
            await db.payment.update({
                where: { id: pending.id },
                data: { status: transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED' },
            });
        }
        const claimed = await db.order.updateMany({
            where: { orderCode, status: 'PENDING_PAYMENT' },
            data: { status: 'EXPIRED' },
        });
        if (claimed.count > 0) {
            await db.orderLog.create({
                data: {
                    orderId: order.id,
                    statusFrom: 'PENDING_PAYMENT',
                    statusTo: 'EXPIRED',
                    description: transactionStatus === 'expire'
                        ? 'Order kedaluwarsa otomatis -- QRIS tidak dibayar sampai batas waktu Midtrans.'
                        : `Order dibatalkan otomatis -- notifikasi Midtrans: ${transactionStatus}.`,
                },
            });
        }
        return;
    }
    // Status lain (mis. 'pending' dari Midtrans sendiri saat baru dibuat) -- tidak
    // perlu aksi apa pun, itu bukan status akhir.
}
/** Dipanggil dari tombol "Simulasikan Pembayaran Berhasil" -- HANYA jalan di mock mode. */
export async function mockConfirmPayment(orderCode) {
    if (!isMockMode) {
        throw new Error('mockConfirmPayment hanya berlaku saat MIDTRANS_SERVER_KEY kosong (mock mode)');
    }
    const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
    const pending = await db.payment.findFirst({ where: { orderId: order.id, status: 'PENDING' } });
    if (pending) {
        await db.payment.update({ where: { id: pending.id }, data: { status: 'SUCCESS', paidAt: new Date() } });
    }
    return markWaitingForSignature(orderCode);
}
/** Dipanggil dari tombol "Simulasikan Kedaluwarsa" -- HANYA jalan di mock mode. Menguji perilaku yang sama dengan handleMidtransNotification untuk transaction_status='expire'. */
export async function mockExpirePayment(orderCode) {
    if (!isMockMode) {
        throw new Error('mockExpirePayment hanya berlaku saat MIDTRANS_SERVER_KEY kosong (mock mode)');
    }
    const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
    const pending = await db.payment.findFirst({ where: { orderId: order.id, status: 'PENDING' } });
    if (pending) {
        await db.payment.update({ where: { id: pending.id }, data: { status: 'EXPIRED' } });
    }
    const claimed = await db.order.updateMany({
        where: { orderCode, status: 'PENDING_PAYMENT' },
        data: { status: 'EXPIRED' },
    });
    if (claimed.count > 0) {
        await db.orderLog.create({
            data: {
                orderId: order.id,
                statusFrom: 'PENDING_PAYMENT',
                statusTo: 'EXPIRED',
                description: 'Order kedaluwarsa (disimulasikan demo mode).',
            },
        });
    }
    return db.order.findUniqueOrThrow({ where: { orderCode } });
}
