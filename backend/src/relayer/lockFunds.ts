import { ethers } from 'ethers';
import { escrowContract } from './contract.js';
import { db } from '../db/client.js';

/** @param amountStablecoinUnits nilai SATUAN TERKECIL (6 desimal) -- hasil dari toStablecoinUnits(), dipanggil langsung ke smart contract. */
export async function lockFunds(orderCode: string, buyer: string, seller: string, amountStablecoinUnits: bigint, deadline: bigint, signature: string) {
  const orderId = ethers.keccak256(ethers.toUtf8Bytes(orderCode));

  const tx = await escrowContract.lockFunds(orderId, buyer, seller, amountStablecoinUnits, deadline, signature);
  const receipt = await tx.wait();

  const order = await db.order.findUniqueOrThrow({ where: { orderCode } });

  await db.onchainEvent.create({
    data: {
      orderId: order.id,
      eventType: 'LOCKED',
      txHash: receipt.hash,
      blockNumber: BigInt(receipt.blockNumber),
      amountStablecoin: order.amountStablecoin, // human-readable, KONSISTEN dengan record lain -- BUKAN parameter mentah di atas
      fromAddress: buyer,
      toAddress: await escrowContract.getAddress(),
    },
  });

  await db.order.update({
    where: { id: order.id },
    data: { status: 'LOCKED_IN_ESCROW', txHashLock: receipt.hash },
  });

  return receipt;
}
