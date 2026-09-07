import { db } from '../../db/client.js';
import { releaseFunds } from '../../relayer/releaseFunds.js';
import { refundFunds } from '../../relayer/refundFunds.js';
import { refundToBuyer } from '../payouts/payouts.service.js';
import { getUserByPrivyDid } from '../users/users.service.js';

type Decision = 'RELEASE_TO_SELLER' | 'REFUND_TO_BUYER';

/** Daftar order berstatus DISPUTED untuk panel admin, lengkap dengan alasan sengketa terakhir. */
export async function listDisputes() {
  const orders = await db.order.findMany({
    where: { status: 'DISPUTED' },
    include: { seller: true, buyer: true, logs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { updatedAt: 'desc' },
  });

  return orders.map((order) => ({
    ...order,
    disputeReason: order.logs[0]?.description ?? null,
  }));
}

/**
 * Dipanggil admin lewat panel internal setelah meninjau sengketa. Ini SATU-SATUNYA
 * jalan keluar dari status DISPUTED -- tanpa ini, order akan macet selamanya begitu
 * pembeli klik "Ajukan Sengketa".
 */
export async function resolveDispute(orderCode: string, decision: Decision, adminPrivyDid: string, description: string) {
  const order = await db.order.findUniqueOrThrow({ where: { orderCode } });
  const admin = await getUserByPrivyDid(adminPrivyDid);
  if (!admin) {
    throw new Error('Admin belum sync ke tabel users');
  }

  if (order.status !== 'DISPUTED') {
    throw new Error(`Order ${orderCode} bukan berstatus DISPUTED (sekarang: ${order.status})`);
  }

  if (decision === 'RELEASE_TO_SELLER') {
    await db.orderLog.create({
      data: { orderId: order.id, statusFrom: 'DISPUTED', statusTo: 'COMPLETED', description, actorId: admin.id },
    });
    return releaseFunds(orderCode); // releaseFunds.ts sudah urus onchain + sweep + payout seller
  }

  // REFUND_TO_BUYER -- skenario B, dana sudah locked, harus lewat smart contract dulu
  await db.orderLog.create({
    data: { orderId: order.id, statusFrom: 'DISPUTED', statusTo: 'CANCELLED_REFUNDED', description, actorId: admin.id },
  });
  const receipt = await refundFunds(orderCode); // sudah urus onchain refund + sweep
  await refundToBuyer(order.id, 'dispute_resolved_buyer', 'MANUAL_ADMIN'); // baru payout fiat-nya
  return receipt;
}
