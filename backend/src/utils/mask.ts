/**
 * Sensor data pribadi untuk ditampilkan publik. Dijalankan di BACKEND (bukan
 * frontend) supaya data mentahnya tidak pernah keluar sama sekali dari server
 * untuk endpoint yang publik/tanpa login.
 */

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) return `${local[0] ?? '*'}***@${domain ?? '***'}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

/** Berlaku juga untuk nomor DANA/e-wallet, bukan cuma nomor telepon pribadi -- sama-sama data sensitif. */
export function maskPhoneOrAccountNumber(value: string): string {
  if (value.length <= 6) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}
