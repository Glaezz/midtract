import { Router } from 'express';
import * as usersService from './users.service.js';
import { requirePrivyAuth } from '../../middleware/privyAuth.js';

export const usersRouter = Router();

/** Dipanggil frontend tepat setelah login sukses lewat Privy (sekali per sesi cukup). */
usersRouter.post('/sync', requirePrivyAuth, async (req, res) => {
  const { email, walletAddress, name, phoneNumber } = req.body;

  if (!email || !walletAddress) {
    return res.status(400).json({ error: 'email dan walletAddress wajib diisi' });
  }

  // privyDid TIDAK diambil dari body request -- dari token yang sudah diverifikasi
  // middleware, supaya user tidak bisa daftar mengatasnamakan privyDid orang lain.
  const user = await usersService.upsertUserFromPrivy({
    privyDid: req.privyUserId!,
    email,
    walletAddress,
    name,
    phoneNumber,
  });
  res.json({ id: user.id.toString(), privyDid: user.privyDid, walletAddress: user.walletAddress });
});

/** Dipakai frontend buat tahu "user yang login ini siapa" -- termasuk isAdmin, buat tentukan panel apa yang muncul di halaman detail. */
usersRouter.get('/me', requirePrivyAuth, async (req, res) => {
  const user = await usersService.getUserByPrivyDid(req.privyUserId!);
  if (!user) {
    return res.status(404).json({ error: 'User belum sync' });
  }
  res.json({
    id: user.id.toString(),
    privyDid: user.privyDid,
    walletAddress: user.walletAddress,
    isAdmin: user.isAdmin,
    name: user.name,
    phoneNumber: user.phoneNumber,
  });
});
