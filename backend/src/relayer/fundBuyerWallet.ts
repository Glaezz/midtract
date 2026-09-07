import { ethers } from 'ethers';
import { tokenContract, escrowContract } from './contract.js';
import { db } from '../db/client.js';
import { ensureOnboardedForSweep } from './allowance.js';
import { env } from '../config/env.js';

/**
 * Top-up wallet buyer dengan USDC dari pool wallet, SEBELUM buyer diminta sign lockFunds --
 * supaya saat lockFunds dipanggil, transferFrom(buyer, escrow, amount) punya saldo untuk ditarik,
 * dan address buyer yang genuine muncul sebagai pengirim di Transfer event on-chain.
 *
 * Dipanggil dari webhook Midtrans, tepat setelah QRIS sukses (sebelum status WAITING_FOR_SIGNATURE
 * ditampilkan ke frontend).
 */
export async function fundBuyerWallet(orderCode: string) {
  const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { buyer: true } });
  if (!order.buyer) throw new Error(`Order ${orderCode} belum punya buyer, tidak bisa di-fund`);

  // Defense-in-depth: jangan pernah top-up ke wallet yang tidak bisa kita tarik balik.
  await ensureOnboardedForSweep(order.buyer.walletAddress, order.amountStablecoin, 'Pembeli');

  const amount = ethers.parseUnits(order.amountStablecoin.toString(), 6); // USDC = 6 desimal

  const tx = await tokenContract.transfer(order.buyer.walletAddress, amount);
  const receipt = await tx.wait();

  await db.onchainEvent.create({
    data: {
      orderId: order.id,
      eventType: 'POOL_FUNDING', // pool wallet -> wallet buyer, LANGKAH TERPISAH dari LOCKED
      txHash: receipt.hash,
      blockNumber: BigInt(receipt.blockNumber),
      amountStablecoin: order.amountStablecoin,
      fromAddress: env.contracts.poolWalletAddress,
      toAddress: order.buyer.walletAddress,
    },
  });

  return receipt;
}

/**
 * Tarik BALIK top-up dari wallet buyer ke pool wallet, kalau buyer tidak lanjut sign lockFunds
 * sampai signature_deadline_at lewat. TIDAK butuh signature buyer -- pakai allowance forwarder
 * yang sudah di-approve saat onboarding (lewat sweep() di kontrak Midtract, BUKAN transfer plain,
 * karena dana ini sekarang ada di wallet buyer, bukan di pool wallet lagi).
 */
export async function reclaimUnusedTopup(orderCode: string) {
  const order = await db.order.findUniqueOrThrow({ where: { orderCode }, include: { buyer: true } });
  if (!order.buyer) return; // tidak pernah di-fund karena belum ada buyer, tidak ada yang direclaim

  const amount = ethers.parseUnits(order.amountStablecoin.toString(), 6);

  try {
    const tx = await escrowContract.sweep(order.buyer.walletAddress, amount);
    const receipt = await tx.wait();

    await db.onchainEvent.create({
      data: {
        orderId: order.id,
        eventType: 'RECLAIMED_TO_POOL',
        txHash: receipt.hash,
        blockNumber: BigInt(receipt.blockNumber),
        amountStablecoin: order.amountStablecoin,
        fromAddress: order.buyer.walletAddress,
        toAddress: env.contracts.poolWalletAddress,
      },
    });
  } catch (err) {
    // Error ethers v6 punya shortMessage berisi nama custom error kontrak
    const e = err as Error & { shortMessage?: string };
    const msg = String(e?.shortMessage ?? e?.message ?? err);

    if (/allowance|InsufficientAllowance/i.test(msg)) {
      // KRITIS -- beda dari "belum pernah di-fund": dana NYATA ada di wallet buyer
      // tapi tidak punya izin ditarik (buyer skip onboarding). Jangan diamkan,
      // ini butuh tindakan manual (minta user onboarding / transfer admin).
      console.error(
        `[reclaim] KRITIS ${orderCode}: USDC top-up TERSELAMATKAN di wallet buyer ` +
          `(${order.buyer.walletAddress}) karena tidak ada allowance ke escrow. ` +
          'Butuh tindakan admin/user.',
      );
    } else {
      // Kalau buyer ternyata belum pernah di-fund, sweep revert ERC20InsufficientBalance
      // -- itu wajar, bukan kegagalan sistem. Log saja supaya job auto-refund tetap lanjut.
      console.warn(`[reclaim] Tidak ada yang direclaim untuk ${orderCode}:`, msg);
    }
  }
}
