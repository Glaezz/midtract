import { Router } from 'express';
import { createPayment, mockConfirmPayment, handleMidtransNotification } from './payments.service.js';
import { requirePrivyAuth } from '../../middleware/privyAuth.js';
import { serializeBigInt } from '../../utils/serialize.js';

export const paymentsRouter = Router();

/** Dipanggil frontend setelah buyer join order -- balikin snap_token buat window.snap.pay(). */
paymentsRouter.post('/:orderCode/create', requirePrivyAuth, async (req, res) => {
  try {
    const result = await createPayment(req.params.orderCode);
    res.json(serializeBigInt(result));
  } catch (err) {
    // Mis. pembeli belum onboarding -- pesan errornya memang ditujukan ke user
    res.status(400).json({ error: (err as Error).message });
  }
});

/** Cuma aktif kalau backend jalan mock mode (MIDTRANS_SERVER_KEY kosong). */
paymentsRouter.post('/:orderCode/mock-confirm', requirePrivyAuth, async (req, res) => {
  const order = await mockConfirmPayment(req.params.orderCode);
  res.json(serializeBigInt(order));
});

/** Callback server-to-server dari Midtrans -- signature diverifikasi otomatis oleh SDK. */
paymentsRouter.post('/webhook/midtrans', async (req, res) => {
  try {
    await handleMidtransNotification(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('[midtrans webhook] gagal diproses:', err);
    res.status(400).json({ error: (err as Error).message });
  }
});
