import { Router } from 'express';
import * as ordersService from './orders.service.js';
import { serializeBigInt } from '../../utils/serialize.js';
import { requirePrivyAuth } from '../../middleware/privyAuth.js';

export const ordersRouter = Router();

ordersRouter.post('/', requirePrivyAuth, async (req, res) => {
  try {
    const order = await ordersService.createOrder({ ...req.body, sellerPrivyDid: req.privyUserId! });
    res.status(201).json(serializeBigInt(order));
  } catch (err) {
    // Mis. penjual belum onboarding -- pesan errornya memang ditujukan ke user
    res.status(400).json({ error: (err as Error).message });
  }
});

/** Dashboard -- daftar rekber milik user, dipisah per peran. */
ordersRouter.get('/', requirePrivyAuth, async (req, res) => {
  const role = req.query.role === 'buyer' ? 'buyer' : 'seller';
  const orders = await ordersService.listOrdersForUser(req.privyUserId!, role);
  res.json(serializeBigInt(orders));
});

/**
 * Live ticker publik -- HARUS didaftarkan sebelum GET /:orderCode, kalau tidak
 * Express bakal menganggap "recent" sebagai nilai parameter :orderCode.
 */
ordersRouter.get('/recent', async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const orders = await ordersService.listRecentPublicOrders(limit);
  res.json(serializeBigInt(orders));
});

/** Resolve halaman undangan -- publik (belum tentu login), data yang dikembalikan sengaja terbatas. */
ordersRouter.get('/invite/:inviteToken', async (req, res) => {
  const details = await ordersService.getInviteDetails(req.params.inviteToken);
  res.json(serializeBigInt(details));
});

/** Satu-satunya gerbang jadi pembeli -- lewat inviteToken, BUKAN orderCode. */
ordersRouter.post('/invite/:inviteToken/join', requirePrivyAuth, async (req, res) => {
  try {
    const { buyerPayoutChannel, buyerPayoutNumber } = req.body;
    const order = await ordersService.joinOrderByInvite(req.params.inviteToken, req.privyUserId!, buyerPayoutChannel, buyerPayoutNumber);
    res.json(serializeBigInt(order));
  } catch (err) {
    // Mis. pembeli belum onboarding -- pesan errornya memang ditujukan ke user
    res.status(400).json({ error: (err as Error).message });
  }
});

ordersRouter.get('/:orderCode', async (req, res) => {
  // Publik -- ini justru fitur transparansi (Hero Section), sengaja tidak dikunci.
  // inviteToken TIDAK ikut di response ini (lihat orders.service.ts).
  const order = await ordersService.getOrderDetail(req.params.orderCode);
  res.json(serializeBigInt(order));
});

ordersRouter.get('/:orderCode/invite-link', requirePrivyAuth, async (req, res) => {
  const result = await ordersService.getInviteLinkForSeller(req.params.orderCode, req.privyUserId!);
  res.json(result);
});

ordersRouter.get('/:orderCode/timeline', async (req, res) => {
  const timeline = await ordersService.getOrderTimeline(req.params.orderCode);
  res.json(serializeBigInt(timeline));
});

ordersRouter.post('/lock', requirePrivyAuth, async (req, res) => {
  const { orderCode, buyerWallet, deadline, signature } = req.body;
  const receipt = await ordersService.confirmLock(orderCode, buyerWallet, BigInt(deadline), signature);
  res.json({ txHash: receipt.hash });
});

ordersRouter.post('/:orderCode/courier', requirePrivyAuth, async (req, res) => {
  const { courierName, courierReceiptNumber } = req.body;
  const order = await ordersService.markInTransit(req.params.orderCode, courierName, courierReceiptNumber);
  res.json(serializeBigInt(order));
});

ordersRouter.post('/:orderCode/confirm-delivered', requirePrivyAuth, async (req, res) => {
  const receipt = await ordersService.confirmDelivered(req.params.orderCode);
  res.json({ txHash: receipt.hash });
});

ordersRouter.post('/:orderCode/dispute', requirePrivyAuth, async (req, res) => {
  const order = await ordersService.raiseDispute(req.params.orderCode, req.body.description);
  res.json(serializeBigInt(order));
});
