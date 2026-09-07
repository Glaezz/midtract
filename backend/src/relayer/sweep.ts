import { escrowContract } from './contract.js';
import { db } from '../db/client.js';
import { toStablecoinUnits } from './units.js';
import { env } from '../config/env.js';
import type { Prisma } from '@prisma/client';

/**
 * @param amountStablecoin nilai HUMAN-READABLE (mis. 5.61), BUKAN satuan terkecil --
 *   konversi ke satuan terkecil dilakukan di dalam fungsi ini, konsisten dengan
 *   satuan yang dipakai di seluruh tabel *.amount_stablecoin lainnya.
 */
export async function sweep(orderId: bigint, fromAddress: string, amountStablecoin: Prisma.Decimal | number) {
  const amount = toStablecoinUnits(amountStablecoin);

  const tx = await escrowContract.sweep(fromAddress, amount);
  const receipt = await tx.wait();

  await db.onchainEvent.create({
    data: {
      orderId,
      eventType: 'SWEPT_TO_POOL',
      txHash: receipt.hash,
      blockNumber: BigInt(receipt.blockNumber),
      amountStablecoin, // simpan versi human-readable, KONSISTEN dengan record onchain_events lain
      fromAddress,
      toAddress: env.contracts.poolWalletAddress,
    },
  });

  return receipt;
}
