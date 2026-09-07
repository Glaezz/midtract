import { Router } from 'express';
import * as disputesService from './disputes.service.js';
import { requirePrivyAuth } from '../../middleware/privyAuth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { serializeBigInt } from '../../utils/serialize.js';

export const disputesRouter = Router();

disputesRouter.use(requirePrivyAuth, requireAdmin); // SEMUA endpoint di bawah ini WAJIB admin

disputesRouter.get('/', async (_req, res) => {
  const disputes = await disputesService.listDisputes();
  res.json(serializeBigInt(disputes));
});

disputesRouter.post('/:orderCode/resolve', async (req, res) => {
  const { decision, description } = req.body;

  if (decision !== 'RELEASE_TO_SELLER' && decision !== 'REFUND_TO_BUYER') {
    return res.status(400).json({ error: 'decision harus RELEASE_TO_SELLER atau REFUND_TO_BUYER' });
  }

  const receipt = await disputesService.resolveDispute(req.params.orderCode, decision, req.privyUserId!, description);
  res.json({ txHash: receipt.hash });
});
