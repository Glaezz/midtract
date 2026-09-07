import { env } from '../../config/env.js';
import { db } from '../../db/client.js';
/**
 * Kalau OKECONNECT_API_KEY kosong di .env, jalankan MOCK MODE.
 *
 * CATATAN PENTING: Okeconnect TIDAK PUNYA dokumentasi API publik maupun mode
 * sandbox/testing resmi (sudah dicek -- ini memang kondisi platformnya, bukan
 * kelalaian riset). Jadi bentuk respons di bawah ini BUKAN tiruan dari format
 * asli mereka -- itu MURNI struktur asumsi yang saya buat masuk akal untuk
 * keperluan demo (payout_id, status, timestamp), supaya alur & data yang
 * tersimpan tetap konsisten walau tanpa API asli. Kalau nanti pegang akun
 * Okeconnect sungguhan, sesuaikan `callOkeconnectDisbursement` dengan format
 * respons yang SEBENARNYA mereka kirim (kemungkinan besar beda dari ini).
 */
const isMockMode = !env.okeconnect.apiKey;
async function callOkeconnectDisbursement(recipientNumber, amountIdr) {
    if (isMockMode) {
        // Struktur respons di bawah ini ASUMSI, lihat catatan di atas.
        const mockResponse = {
            status: 'success',
            data: {
                reference_id: `MOCK-OC-${Date.now()}`,
                destination: recipientNumber,
                amount: Number(amountIdr),
                channel: 'DANA',
                processed_at: new Date().toISOString(),
            },
        };
        return { providerPayoutId: mockResponse.data.reference_id };
    }
    const res = await fetch(`${env.okeconnect.baseUrl}/disbursement`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.okeconnect.apiKey}`,
        },
        body: JSON.stringify({ destination: recipientNumber, amount: amountIdr.toString(), channel: 'DANA' }),
    });
    if (!res.ok) {
        throw new Error(`Okeconnect payout gagal: HTTP ${res.status}`);
    }
    // TODO: sesuaikan parsing ini dengan format respons ASLI Okeconnect begitu
    // kalian punya akun sungguhan -- field `payout_id` di bawah cuma tebakan.
    const data = (await res.json());
    return { providerPayoutId: data.payout_id };
}
/** Pencairan ke PENJUAL, dipanggil setelah releaseFunds() on-chain sukses. */
export async function disburseToSeller(orderId) {
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
    const payout = await db.payout.create({
        data: {
            orderId,
            provider: isMockMode ? 'mock' : 'okeconnect',
            recipientChannel: order.sellerPayoutChannel,
            recipientNumber: order.sellerPayoutNumber,
            amountIdr: order.amountIdr,
            status: 'PENDING',
        },
    });
    try {
        const { providerPayoutId } = await callOkeconnectDisbursement(order.sellerPayoutNumber, order.amountIdr);
        return db.payout.update({
            where: { id: payout.id },
            data: { status: 'SUCCESS', providerPayoutId, disbursedAt: new Date() },
        });
    }
    catch (err) {
        await db.payout.update({ where: { id: payout.id }, data: { status: 'FAILED' } });
        throw err;
    }
}
/** Refund ke PEMBELI -- dipakai baik skenario A (sebelum lock) maupun B (sesudah lock). */
export async function refundToBuyer(orderId, reason, triggerType) {
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
    if (!order.buyerPayoutChannel || !order.buyerPayoutNumber) {
        throw new Error(`Order ${order.orderCode} tidak punya buyer_payout_number, tidak bisa refund`);
    }
    const refund = await db.refund.create({
        data: {
            orderId,
            recipientChannel: order.buyerPayoutChannel,
            recipientNumber: order.buyerPayoutNumber,
            amountIdr: order.amountIdr,
            reason,
            triggerType,
            status: 'PENDING',
        },
    });
    try {
        await callOkeconnectDisbursement(order.buyerPayoutNumber, order.amountIdr);
        return db.refund.update({
            where: { id: refund.id },
            data: { status: 'SUCCESS', refundedAt: new Date() },
        });
    }
    catch (err) {
        await db.refund.update({ where: { id: refund.id }, data: { status: 'FAILED' } });
        throw err;
    }
}
