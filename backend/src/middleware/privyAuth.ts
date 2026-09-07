import type { NextFunction, Request, Response } from 'express';
import { PrivyClient } from '@privy-io/node';
import { env } from '../config/env.js';

const privyClient = new PrivyClient({ appId: env.privy.appId, appSecret: env.privy.appSecret });

declare global {
  namespace Express {
    interface Request {
      privyUserId?: string; // privy_did dari token yang terverifikasi
    }
  }
}

/**
 * Verifikasi token sesi Privy yang dikirim frontend lewat header Authorization.
 * Kita TIDAK menyimpan/mengelola token sendiri (beda dari Laravel Sanctum) --
 * Privy yang menerbitkan & mengelola token-nya, tugas kita cuma verifikasi
 * keasliannya lewat SDK mereka di setiap request ke endpoint yang sensitif.
 *
 * Pakai @privy-io/node (bukan @privy-io/server-auth yang sudah deprecated).
 */
export async function requirePrivyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    // SDK @privy-io/node menerima token MENTAH (string), bukan objek --
    // respons verifikasi memakai field `user_id`, bukan `userId`.
    const verifiedClaims = await privyClient.utils().auth().verifyAccessToken(token);
    req.privyUserId = verifiedClaims.user_id;

    if (!req.privyUserId) {
      throw new Error('userId tidak ditemukan di response verifyAccessToken');
    }

    next();
  } catch (err) {
    console.error('Verifikasi token Privy gagal:', err);
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}
