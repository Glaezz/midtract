import { ethers } from 'ethers';
import { escrowContract } from './contract.js';
import { db } from '../db/client.js';
import { sweep } from './sweep.js';
import { disburseToSeller } from '../modules/payouts/payouts.service.js';
export async function releaseFunds(orderCode) {
    const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { seller: true } });
    const orderId = ethers.keccak256(ethers.toUtf8Bytes(orderCode));
    const tx = await escrowContract.releaseFunds(orderId);
    const receipt = await tx.wait();
    await db.onchainEvent.create({
        data: {
            orderId: order.id,
            eventType: 'RELEASED',
            txHash: receipt.hash,
            blockNumber: BigInt(receipt.blockNumber),
            amountStablecoin: order.amountStablecoin,
            fromAddress: await escrowContract.getAddress(),
            toAddress: order.seller.walletAddress,
        },
    });
    // Sweep ke pool -- tidak butuh signature penjual (allowance dari onboarding)
    await sweep(order.id, order.seller.walletAddress, order.amountStablecoin);
    await db.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', txHashRelease: receipt.hash },
    });
    // Baru sekarang uang beneran sampai ke DANA penjual
    await disburseToSeller(order.id);
    return receipt;
}
