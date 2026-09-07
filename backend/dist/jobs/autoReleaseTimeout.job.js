import cron from 'node-cron';
import { db } from '../db/client.js';
import { releaseFunds } from '../relayer/releaseFunds.js';
/** Jalan tiap 5 menit — portable, tidak bergantung fitur cron platform apa pun (Vercel dsb),
 *  supaya tetap jalan sama persis saat juri install & run di laptop lokal mereka. */
export function startAutoReleaseTimeoutJob() {
    cron.schedule('*/5 * * * *', async () => {
        const overdue = await db.order.findMany({
            where: { status: 'IN_TRANSIT', autoReleaseAt: { lt: new Date() } },
        });
        for (const order of overdue) {
            try {
                await releaseFunds(order.orderCode);
                console.log(`[auto-release] ${order.orderCode} released via timeout`);
            }
            catch (err) {
                console.error(`[auto-release] gagal untuk ${order.orderCode}`, err);
            }
        }
    });
}
