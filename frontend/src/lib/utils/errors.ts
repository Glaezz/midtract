import { ethers } from 'ethers';

/**
 * Kalau transaksi revert, ethers/viem kasih kita nama custom error (mis. "Midtract__NotRelayer")
 * beserta argumennya. Fungsi ini menerjemahkannya jadi kalimat yang bisa dibaca pengguna awam,
 * supaya UI tidak menampilkan "execution reverted: 0x1234abcd..." mentah-mentah.
 */

type DecodedError = { name: string; args: unknown[] };

const ERROR_MESSAGES: Record<string, (args: unknown[]) => string> = {
  // ---- Dari kontrak Midtract ----
  Midtract__NotRelayer: () => 'Aksi ini hanya bisa dilakukan oleh sistem, bukan langsung oleh pengguna.',
  Midtract__InvalidStablecoin: () => 'Konfigurasi token pembayaran tidak valid. Hubungi admin.',
  Midtract__InvalidRelayer: () => 'Konfigurasi sistem tidak valid. Hubungi admin.',
  Midtract__InvalidPoolWallet: () => 'Konfigurasi sistem tidak valid. Hubungi admin.',
  Midtract__SignatureExpired: () => 'Sesi konfirmasi sudah kedaluwarsa. Silakan ulangi transaksi.',
  Midtract__OrderAlreadyExists: () => 'Rekber ini sudah pernah diproses sebelumnya.',
  Midtract__BuyerSellerMustDiffer: () => 'Pembeli dan penjual tidak boleh orang yang sama.',
  Midtract__InvalidBuyerSignature: () => 'Konfirmasi tidak valid. Silakan coba tanda tangan ulang.',
  Midtract__TransferFromFailed: () => 'Gagal menarik dana. Silakan coba lagi.',
  Midtract__OrderNotLocked: () => 'Rekber ini belum terkunci atau statusnya sudah berubah.',
  Midtract__TransferToSellerFailed: () => 'Gagal mencairkan dana ke penjual. Silakan coba lagi.',
  Midtract__TransferToBuyerFailed: () => 'Gagal mengembalikan dana ke pembeli. Silakan coba lagi.',
  Midtract__SweepFailed: () => 'Gagal memproses pencairan. Silakan coba lagi.',

  // ---- Dari token (OpenZeppelin ERC-20 / ERC20Permit) ----
  ERC20InsufficientAllowance: () => 'Izin transaksi belum diaktifkan. Silakan aktifkan akun terlebih dahulu.',
  ERC20InsufficientBalance: () => 'Saldo tidak mencukupi untuk transaksi ini.',
  ERC2612ExpiredSignature: () => 'Sesi aktivasi akun sudah kedaluwarsa. Silakan ulangi.',
  ERC2612InvalidSigner: () => 'Verifikasi akun gagal. Silakan coba lagi.',
  OwnableUnauthorizedAccount: () => 'Anda tidak memiliki akses untuk melakukan aksi ini.',
};

const DEFAULT_MESSAGE = 'Transaksi gagal diproses. Silakan coba lagi atau hubungi dukungan.';

/**
 * Coba decode custom error dari sebuah caught error (hasil panggilan kontrak lewat ethers).
 * Mengembalikan null kalau errornya bukan revert custom error yang kita kenali
 * (mis. network error, user reject signature, dll -- itu ditangani terpisah, bukan di sini).
 */
export function decodeContractError(error: unknown, contractInterfaces: ethers.Interface[]): DecodedError | null {
  const errorData = (error as { data?: string; error?: { data?: string } })?.data
    ?? (error as { error?: { data?: string } })?.error?.data;

  if (!errorData || typeof errorData !== 'string') return null;

  for (const iface of contractInterfaces) {
    try {
      const decoded = iface.parseError(errorData);
      if (decoded) return { name: decoded.name, args: [...decoded.args] };
    } catch {
      // errorData tidak cocok dengan ABI interface ini, coba interface berikutnya
      continue;
    }
  }

  return null;
}

/** Fungsi utama yang dipanggil UI: caught error -> pesan yang siap ditampilkan. */
export function translateContractError(error: unknown, contractInterfaces: ethers.Interface[]): string {
  const decoded = decodeContractError(error, contractInterfaces);
  if (!decoded) return DEFAULT_MESSAGE;

  const messageBuilder = ERROR_MESSAGES[decoded.name];
  return messageBuilder ? messageBuilder(decoded.args) : DEFAULT_MESSAGE;
}
