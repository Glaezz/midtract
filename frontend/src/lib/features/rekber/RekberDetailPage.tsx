import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, CheckCircle, Megaphone, Package, Check } from '@phosphor-icons/react';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { useCurrentUser } from '$lib/utils/useCurrentUser';
import { useToast } from '$lib/components/atoms/Toast';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Alert } from '$lib/components/atoms/Alert';
import { Button } from '$lib/components/atoms/Button';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { StatusBadge } from '$lib/components/atoms/StatusBadge';
import { ProgressSteps } from '$lib/components/atoms/ProgressSteps';
import { ConfirmDialog } from '$lib/components/atoms/ConfirmDialog';
import { Field, TextInput, TextArea } from '$lib/components/atoms/Field';
import { OrderTimeline } from '$lib/components/molecules/OrderTimeline';
import { BuyerPaymentPanel } from '$lib/components/molecules/BuyerPaymentPanel';
import { OrderParticipants } from '$lib/components/organism/OrderParticipants';
import { FinancialBreakdown } from '$lib/components/molecules/FinancialBreakdown';
import { CourierInfoCard } from '$lib/components/molecules/CourierInfoCard';
import { LockStatusCard } from '$lib/components/molecules/LockStatusCard';
import { formatIDR } from '$lib/utils/format';
import { calculatePaymentBreakdown } from '$lib/utils/fees';

type Party = { name: string | null; email: string; phoneNumber: string | null; walletAddress: string };

type OrderDetail = {
  orderCode: string;
  productName: string;
  productDescription: string | null;
  amountIdr: string;
  amountStablecoin: string;
  stablecoinRateUsed: string;
  status: string;
  sellerId: string;
  buyerId: string | null;
  courierName: string | null;
  courierReceiptNumber: string | null;
  signatureDeadlineAt: string | null;
  autoReleaseAt: string | null;
  sellerPayoutChannel: string;
  sellerPayoutNumber: string; // sudah tersensor dari backend
  buyerPayoutChannel: string | null;
  buyerPayoutNumber: string | null; // sudah tersensor dari backend
  seller: Party & { id: string };
  buyer: (Party & { id: string }) | null;
};

// Tahapan transaksi yang tampil sebagai progress bar (terbatas di jalur normal).
// Status terminal (DISPUTED / CANCELLED_REFUNDED / EXPIRED) tidak ikut progres --
// ditampilkan sebagai bingkai alert tersendiri.
const PROGRESS_STEPS = [
  { label: 'Dibuat' },
  { label: 'Pembayaran' },
  { label: 'Dana Terkunci' },
  { label: 'Dikirim' },
  { label: 'Selesai' },
];

const STEP_INDEX_BY_STATUS: Record<string, number> = {
  PENDING_PAYMENT: 1,
  FUNDING_IN_PROGRESS: 1,
  WAITING_FOR_SIGNATURE: 2,
  LOCKED_IN_ESCROW: 3,
  IN_TRANSIT: 3,
  DELIVERED_CONFIRMED_BY_BUYER: 4,
  COMPLETED: 5, // semua langkah selesai
};

const HAPPY_PATH_STATUSES = new Set(Object.keys(STEP_INDEX_BY_STATUS));

function DetailSkeleton() {
  return (
    <Container width="default" className="pt-10 pb-20">
      <Card className="space-y-3">
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-full" />
      </Card>
      <Card className="mt-4 space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-16 w-full" />
      </Card>
    </Container>
  );
}

export function RekberDetailPage() {
  const { orderCode } = useParams();
  const { request } = useApiClient();
  const { user, isLoggedIn, isAuthReady } = useCurrentUser();
  const { show } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('');
  const [courierReceiptNumber, setCourierReceiptNumber] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSendingCourier, setIsSendingCourier] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPushingDispute, setIsPushingDispute] = useState(false);
  const [confirmDeliveredOpen, setConfirmDeliveredOpen] = useState(false);

  async function refreshOrder() {
    if (!orderCode) return;
    const data = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderCode}`).then((r) => r.json());
    setOrder(data);
  }

  useEffect(() => {
    refreshOrder();
  }, [orderCode]);

  useEffect(() => {
    if (!order) return;
    const isWaiting = order.status === 'PENDING_PAYMENT' || order.status === 'WAITING_FOR_SIGNATURE';
    if (!isWaiting) return;
    const interval = setInterval(refreshOrder, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, orderCode]);

  const isSeller = !!(user && order && order.sellerId === user.id);
  const isBuyer = !!(user && order && order.buyerId === user.id);
  const isLockedOrLater = !!order && ['LOCKED_IN_ESCROW', 'IN_TRANSIT', 'DELIVERED_CONFIRMED_BY_BUYER', 'DISPUTED'].includes(order.status);

  useEffect(() => {
    if (!isSeller || !orderCode || order?.status !== 'PENDING_PAYMENT') return;
    request<{ inviteToken: string }>(`/api/orders/${orderCode}/invite-link`)
      .then((res) => setInviteLink(`${window.location.origin}/rekber/i/${res.inviteToken}`))
      .catch(() => {});
  }, [isSeller, orderCode, order?.status, request]);

  if (!order) return <DetailSkeleton />;

  const breakdown = calculatePaymentBreakdown(Number(order.amountIdr));

  async function handleCopyInvite() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      show('Link undangan disalin. Kirim lewat chat ke pembeli.', 'success');
    } catch {
      show('Tidak bisa menyalin otomatis di perangkat ini. Salin manual dari kolom di atas.', 'warning');
    }
  }

  async function handleSubmitCourier(e: React.FormEvent) {
    e.preventDefault();
    if (!orderCode || courierName.trim() === '' || courierReceiptNumber.trim() === '') return;

    setIsSendingCourier(true);
    try {
      await request(`/api/orders/${orderCode}/courier`, {
        method: 'POST',
        body: JSON.stringify({ courierName, courierReceiptNumber }),
      });
      await refreshOrder();
      show('Info resi terkirim. Pembeli kini bisa melacak pengiriman.', 'success');
    } catch (err) {
      show(getUserFriendlyErrorMessage(err), 'danger');
    } finally {
      setIsSendingCourier(false);
    }
  }

  async function handleConfirmDelivered() {
    if (!orderCode) return;

    setIsConfirming(true);
    setConfirmDeliveredOpen(false);
    try {
      await request(`/api/orders/${orderCode}/confirm-delivered`, { method: 'POST' });
      await refreshOrder();
      show('Barang diterima. Dana dilepas ke penjual.', 'success');
    } catch (err) {
      show(getUserFriendlyErrorMessage(err), 'danger');
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleRaiseDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!orderCode || disputeDescription.trim() === '') return;

    setIsPushingDispute(true);
    try {
      await request(`/api/orders/${orderCode}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ description: disputeDescription }),
      });
      await refreshOrder();
      show('Sengketa diajukan. Admin akan meninjau dan menghubungi kamu.', 'success');
      setDisputeDescription('');
    } catch (err) {
      show(getUserFriendlyErrorMessage(err), 'danger');
    } finally {
      setIsPushingDispute(false);
    }
  }

  return (
    <Container width="default" className="space-y-4 pt-10 pb-20">
      {/* Kartu utama */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{order.productName}</h1>
            {order.productDescription && (
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{order.productDescription}</p>
            )}
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatIDR(Number(order.amountIdr))}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {HAPPY_PATH_STATUSES.has(order.status) && (
          <ProgressSteps steps={PROGRESS_STEPS} currentIndex={STEP_INDEX_BY_STATUS[order.status]} className="mt-6 border-t border-slate-100 pt-5" />
        )}

        {/* ===== Panel Aksi, kondisional sesuai role & status ===== */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          {isAuthReady && !isLoggedIn && (
            <Alert tone="info" title="Lihat sebagai tamu">
              Masuk untuk berinteraksi dengan rekber ini — bayar, kunci dana, atau kirim resi.
            </Alert>
          )}

          {isSeller && order.status === 'PENDING_PAYMENT' && inviteLink && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Undang pembeli melalui link ini:</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <TextInput
                  readOnly
                  value={inviteLink}
                  onClick={(e) => e.currentTarget.select()}
                  aria-label="Link undangan rekber"
                />
                <Button variant="secondary" onClick={handleCopyInvite} leftIcon={<Copy size={15} aria-hidden="true" />}>
                  Salin
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Selama belum ada pembeli — link bisa kamu bagikan ke beberapa orang sekaligus di chat mana pun.
              </p>
            </div>
          )}

          {isSeller && order.status === 'IN_TRANSIT' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Package size={16} className="text-brand-600" aria-hidden="true" />
                Menunggu konfirmasi pembeli
              </div>
              <p className="mt-1 text-xs leading-relaxed">
                Barang sudah dikirim. Dana dilepas otomatis saat pembeli mengonfirmasi, atau saat batas waktu
                auto-release tiba.
              </p>
            </div>
          )}

          {isBuyer && (order.status === 'PENDING_PAYMENT' || order.status === 'WAITING_FOR_SIGNATURE') && (
            <BuyerPaymentPanel order={order} onStatusChange={refreshOrder} />
          )}

          {isBuyer && order.status === 'IN_TRANSIT' && (
            <div className="space-y-4">
              <Alert tone="info" title="Barang dalam perjalanan">
                Sudah terima pesananmu? Konfirmasi untuk melepas dana ke penjual. Ada masalah? Ajukan sengketa dan
                admin akan turun tangan.
              </Alert>
              <div>
                <Button
                  onClick={() => setConfirmDeliveredOpen(true)}
                  loading={isConfirming}
                  fullWidth
                  leftIcon={!isConfirming && <CheckCircle size={17} aria-hidden="true" />}
                >
                  {isConfirming ? 'Memproses...' : 'Barang Sudah Saya Terima'}
                </Button>
              </div>
              <form onSubmit={handleRaiseDispute} className="space-y-2 border-t border-slate-100 pt-4">
                <Field
                  label="Ajukan sengketa"
                  htmlFor="dispute-desc"
                  helper="Jelaskan masalahnya — admin akan meninjau dan menghubungi kedua pihak."
                >
                  <TextArea
                    id="dispute-desc"
                    rows={3}
                    placeholder="Mis. barang yang diterima tidak sesuai deskripsi..."
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                  />
                </Field>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={disputeDescription.trim() === ''}
                  loading={isPushingDispute}
                  leftIcon={!isPushingDispute && <Megaphone size={15} aria-hidden="true" />}
                >
                  Ajukan Sengketa
                </Button>
              </form>
            </div>
          )}

          {order.status === 'DISPUTED' && (
            <Alert tone="warning" title="Sengketa sedang ditinjau">
              Admin sedang meninjau transaksi ini dan akan menghubungi kedua pihak. Dana tetap terkunci aman selama proses.
            </Alert>
          )}
          {order.status === 'COMPLETED' && (
            <Alert tone="success" title="Rekber selesai">
              Dana sudah dilepas ke penjual. Terima kasih telah bertransaksi dengan aman.
            </Alert>
          )}
          {order.status === 'CANCELLED_REFUNDED' && (
            <Alert tone="info" title="Rekber dibatalkan">
              Dana telah dikembalikan ke pembeli sesuai ketentuan.
            </Alert>
          )}
          {order.status === 'EXPIRED' && (
            <Alert tone="danger" title="Pembayaran kedaluwarsa">
              Pembayaran tidak berhasil atau telah kedaluwarsa, sehingga rekber ini tidak dapat dilanjutkan.
              Silakan buat rekber baru jika ingin melakukan transaksi.
            </Alert>
          )}
        </div>
      </Card>

      {/* Dana terkunci -- informatif, tenggat AUTO-RELEASE (beda dari tenggat sign di BuyerPaymentPanel) */}
      {isLockedOrLater && <LockStatusCard autoReleaseAt={order.autoReleaseAt} />}

      {/* Form input resi -- SECTION TERPISAH dari panel aksi, khusus penjual saat LOCKED_IN_ESCROW */}
      {isSeller && order.status === 'LOCKED_IN_ESCROW' && (
        <Card>
          <div className="flex items-start gap-2.5">
            <Package size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Input Info Pengiriman</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Kirim barang dulu, lalu isi ekspedisi dan nomor resi. Pembeli bisa melacak begitu resi terkirim.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmitCourier} className="mt-4 space-y-4">
            <Field label="Ekspedisi" htmlFor="courier-name">
              <TextInput
                id="courier-name"
                placeholder="Mis. JNE, J&T, SiCepat..."
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
            </Field>
            <Field label="Nomor Resi" htmlFor="courier-receipt">
              <TextInput
                id="courier-receipt"
                placeholder="Mis. JNE1234567890"
                value={courierReceiptNumber}
                onChange={(e) => setCourierReceiptNumber(e.target.value)}
              />
            </Field>
            <Button
              type="submit"
              loading={isSendingCourier}
              disabled={courierName.trim() === '' || courierReceiptNumber.trim() === ''}
              leftIcon={!isSendingCourier && <Check size={16} aria-hidden="true" />}
            >
              Kirim Info Resi
            </Button>
          </form>
        </Card>
      )}

      {/* Info resi read-only -- tampil ke SIAPA SAJA begitu sudah diinput, terpisah dari form di atas */}
      {order.courierName && order.courierReceiptNumber && (
        <CourierInfoCard courierName={order.courierName} courierReceiptNumber={order.courierReceiptNumber} />
      )}

      <OrderParticipants
        seller={order.seller}
        buyer={order.buyer}
        sellerPayoutChannel={order.sellerPayoutChannel}
        sellerPayoutNumber={order.sellerPayoutNumber}
        buyerPayoutChannel={order.buyerPayoutChannel}
        buyerPayoutNumber={order.buyerPayoutNumber}
      />

      <FinancialBreakdown
        productPriceIdr={Number(order.amountIdr)}
        platformFeeIdr={breakdown.platformFeeIdr}
        gatewayFeeIdr={breakdown.gatewayFeeIdr}
        totalIdr={breakdown.totalIdr}
        amountStablecoin={order.amountStablecoin}
        stablecoinRateUsed={Number(order.stablecoinRateUsed)}
      />

      <OrderTimeline orderCode={order.orderCode} />

      {/* Konfirmasi saaat buyer menekan "Barang Diterima" */}
      <ConfirmDialog
        open={confirmDeliveredOpen}
        onClose={() => setConfirmDeliveredOpen(false)}
        title="Konfirmasi barang diterima?"
        description="Dana akan langsung dilepas ke penjual dan tidak bisa dibatalkan. Pastikan barang sudah benar-benar kamu terima."
        confirmLabel="Ya, Barang Sudah Diterima"
        busy={isConfirming}
        onConfirm={handleConfirmDelivered}
      />
    </Container>
  );
}