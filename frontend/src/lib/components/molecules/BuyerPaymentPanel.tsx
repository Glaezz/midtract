import { useState } from 'react';
import { usePrivy, useSignTypedData } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { QrCode, LockKey } from '@phosphor-icons/react';
import { buildLockOrderTypedData, truncateToStablecoinDecimals } from '$lib/utils/eip712';
import { translateContractError } from '$lib/utils/errors';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { getLockNonce } from '$lib/config/readOnlyContracts';
import { useSnapScript } from '$lib/utils/useSnapScript';
import { useToast } from '$lib/components/atoms/Toast';
import { Alert } from '$lib/components/atoms/Alert';
import { Countdown } from '$lib/components/atoms/Countdown';
import { Button } from '$lib/components/atoms/Button';
import MidtractAbi from '@shared/abi/Midtract.json';
import StablecoinPermitAbi from '@shared/abi/StablecoinPermit.json';

// shared/abi/Midtract.json adalah array ABI mentah (tanpa wrapper .abi)
const midtractInterface = new ethers.Interface(MidtractAbi);
const tokenInterface = new ethers.Interface(StablecoinPermitAbi);

type OrderForPayment = {
  orderCode: string;
  amountStablecoin: string;
  status: string;
  signatureDeadlineAt: string | null;
  seller: { walletAddress: string };
};

/**
 * Panel bayar (Snap/QRIS) + sign lock -- diekstrak dari alur lama supaya bisa
 * dipakai ulang di InviteJoinPage (setelah klik join) MAUPUN RekberDetailPage
 * (kalau pembeli buka lewat /rekber/:orderCode langsung, bukan link undangan).
 */
export function BuyerPaymentPanel({ order, onStatusChange }: { order: OrderForPayment; onStatusChange: () => void }) {
  const { user } = usePrivy();
  const { signTypedData } = useSignTypedData();
  const { request } = useApiClient();
  const { isLoaded: snapReady } = useSnapScript();
  const { show } = useToast();

  const [isMockMode, setIsMockMode] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  async function handlePay() {
    if (!order) return;

    setIsPaying(true);
    try {
      const payment = await request<{ token: string; mockMode: boolean }>(`/api/payments/${order.orderCode}/create`, {
        method: 'POST',
      });
      setPaymentInitiated(true);
      setIsMockMode(payment.mockMode);

      if (payment.mockMode) return;

      if (!window.snap) {
        show('Layanan pembayaran belum siap. Coba lagi sebentar.', 'warning');
        return;
      }

      // Reset sesi/overlay Snap dari transaksi sebelumnya -- tanpa ini, pay()
      // kedua sering gagal render popup (kena CSP iframe sandbox Midtrans).
      window.snap.hide?.();

      window.snap.pay(payment.token, {
        onSuccess: onStatusChange,
        onPending: onStatusChange,
        onError: () => show('Pembayaran gagal. Silakan coba lagi.', 'danger'),
        onClose: onStatusChange,
      });
    } catch (err) {
      // Mis. pembeli belum onboarding -- tampilkan pesan backend apa adanya
      show(getUserFriendlyErrorMessage(err), 'danger');
    } finally {
      setIsPaying(false);
    }
  }

  async function handleMockConfirm() {
    await request(`/api/payments/${order.orderCode}/mock-confirm`, { method: 'POST' });
    onStatusChange();
  }

  async function handleSignLock() {
    if (!user?.wallet?.address) return;

    setIsSigning(true);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 900);
      const nonce = await getLockNonce(user.wallet.address);
      // Nominal dari DB bisa punya >6 desimal -- potong dulu (identik dengan
      // toStablecoinUnits backend) sebelum parseUnits, kalau tidak NUMERIC_FAULT.
      const amountStablecoinUnits = ethers.parseUnits(truncateToStablecoinDecimals(order.amountStablecoin), 6);

      const typedData = buildLockOrderTypedData(order.orderCode, user.wallet.address, order.seller.walletAddress, amountStablecoinUnits, nonce, deadline);
      // Privy v3 resolve-nya OBJEK { signature: '0x...' }, bukan string hex
      const { signature } = await signTypedData(typedData);

      await request('/api/orders/lock', {
        method: 'POST',
        body: JSON.stringify({
          orderCode: order.orderCode,
          buyerWallet: user.wallet.address,
          deadline: deadline.toString(),
          signature,
        }),
      });
      onStatusChange();
    } catch (err) {
      show(translateContractError(err, [midtractInterface, tokenInterface]), 'danger');
    } finally {
      setIsSigning(false);
    }
  }

  if (order.status === 'PENDING_PAYMENT' && !isMockMode && !paymentInitiated) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button
          onClick={handlePay}
          loading={isPaying}
          disabled={!snapReady}
          fullWidth
          leftIcon={!isPaying && <QrCode size={17} aria-hidden="true" />}
        >
          {isPaying ? 'Menyiapkan pembayaran...' : 'Bayar Sekarang'}
        </Button>
        <p className="text-xs leading-relaxed text-slate-500">
          Pembayaran lewat QRIS. Pembayaran akan diverifikasi otomatis, lalu dana dikunci kontrak pintar.
        </p>
      </div>
    );
  }

  if (isMockMode && order.status === 'PENDING_PAYMENT') {
    return (
      <div className="space-y-2">
        <Alert tone="warning" title="Mode demo aktif">
          Backend tidak punya kunci Midtrans, jadi transaksi tidak benar-benar diproses. Gunakan tombol berikut
          untuk simulasi pembayaran berhasil.
        </Alert>
        <Button variant="secondary" onClick={handleMockConfirm} fullWidth>
          [Demo] Simulasikan Pembayaran Berhasil
        </Button>
      </div>
    );
  }

  if (paymentInitiated && !isMockMode && order.status === 'PENDING_PAYMENT') {
    return (
      <Alert tone="info" title="Menunggu pembayaran">
        Selesaikan pembayaran di jendela QRIS. Halaman ini diperbarui otomatis.
      </Alert>
    );
  }

  if (order.status === 'WAITING_FOR_SIGNATURE') {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Dana siap dikunci</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Nilai terkunci untuk rekber ini: <span className="font-semibold text-slate-800">{order.amountStablecoin} USDC</span>.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-xl bg-brand-600 p-2.5 text-white sm:block">
            <LockKey size={20} weight="duotone" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-3">
          <Countdown target={order.signatureDeadlineAt} label="Batas waktu:" />
          {order.signatureDeadlineAt && (
            <p className="mt-0.5 text-xs text-slate-500">
              Lewat batas waktu, pembayaran akan dibatalkan dan danamu dikembalikan.
            </p>
          )}
        </div>

        <Button onClick={handleSignLock} loading={isSigning} className="mt-3" fullWidth leftIcon={!isSigning && <LockKey size={17} aria-hidden="true" />}>
          {isSigning ? 'Mengkunci dana...' : 'Kunci Dana Sekarang'}
        </Button>
      </div>
    );
  }

  return null;
}