import cron from 'node-cron';
import { db } from '../db/client.js';
import { reclaimUnusedTopup } from '../relayer/fundBuyerWallet.js';
import { refundToBuyer } from '../modules/payouts/payouts.service.js';
/**
 * Skenario A (refund SEBELUM lock) -- murni transfer fiat ke buyer, TIDAK menyentuh
 * smart contract Midtract untuk refund itu sendiri. Tapi tetap perlu reclaim top-up
 * USDC yang sudah dikirim dari pool wallet (lihat markWaitingForSignature di
 * orders.service.ts) supaya treasury pool wallet tidak berkurang percuma.
 */
export function startAutoRefundBeforeLockJob() {
    cron.schedule('*/5 * * * *', async () => {
        const overdue = await db.order.findMany({
            where: { status: 'WAITING_FOR_SIGNATURE', signatureDeadlineAt: { lt: new Date() } },
        });
        for (const order of overdue) {
            try {
                await reclaimUnusedTopup(order.orderCode); // tarik balik USDC dulu
                await db.order.update({ where: { id: order.id }, data: { status: 'CANCELLED_REFUNDED' } });
                await refundToBuyer(order.id, 'timeout_signature', 'AUTO_TIMEOUT');
                console.log(`[auto-refund] ${order.orderCode} di-refund karena timeout signature`);
            }
            catch (err) {
                console.error(`[auto-refund] gagal untuk ${order.orderCode}`, err);
            }
        }
    });
}
