import { ethers } from 'ethers';
import { escrowContract } from './contract.js';
import { db } from '../db/client.js';
import { sweep } from './sweep.js';
/**
 * Untuk refund SEBELUM lock (skenario A), JANGAN panggil fungsi ini —
 * itu murni transfer fiat di modules/payouts, tidak menyentuh kontrak.
 * Fungsi ini khusus skenario B: dana sudah LOCKED_IN_ESCROW.
 */
export async function refundFunds(orderCode) {
    const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { buyer: true } });
    if (!order.buyer)
        throw new Error('Order belum punya buyer, tidak mungkin sudah locked');
    const orderId = ethers.keccak256(ethers.toUtf8Bytes(orderCode));
    const tx = await escrowContract.refundFunds(orderId);
    const receipt = await tx.wait();
    await db.onchainEvent.create({
        data: {
            orderId: order.id,
            eventType: 'REFUNDED_ONCHAIN',
            txHash: receipt.hash,
            blockNumber: BigInt(receipt.blockNumber),
            amountStablecoin: order.amountStablecoin,
            fromAddress: await escrowContract.getAddress(),
            toAddress: order.buyer.walletAddress,
        },
    });
    await sweep(order.id, order.buyer.walletAddress, order.amountStablecoin);
    await db.order.update({ where: { id: order.id }, data: { status: 'CANCELLED_REFUNDED' } });
    // Payout Rupiah ke buyer TIDAK dipanggil di sini -- itu tanggung jawab
    // pemanggil fungsi ini (lihat modules/disputes/disputes.service.ts), supaya
    // fungsi ini tetap murni "urusan on-chain" saja, tidak campur fiat.
    return receipt;
}
