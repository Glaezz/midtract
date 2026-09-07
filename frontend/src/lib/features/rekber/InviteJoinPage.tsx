import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, LinkBreak } from '@phosphor-icons/react';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { useCurrentUser } from '$lib/utils/useCurrentUser';
import { useRequireOnboarding } from '$lib/utils/useRequireOnboarding';
import { calculatePaymentBreakdown } from '$lib/utils/fees';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Button } from '$lib/components/atoms/Button';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { Alert } from '$lib/components/atoms/Alert';
import { EmptyState } from '$lib/components/atoms/EmptyState';
import { Field, TextInput } from '$lib/components/atoms/Field';
import { formatIDR } from '$lib/utils/format';

type InviteDetail = {
  orderCode: string;
  productName: string;
  productDescription: string | null;
  amountIdr: string;
  status: string;
  canJoin: boolean;
  sellerId: string;
};

export function InviteJoinPage() {
  useRequireOnboarding(); // lempar ke /onboarding kalau allowance pembeli masih kosong
  const { inviteToken } = useParams();
  const { request } = useApiClient();
  const { user, isLoggedIn, isAuthReady } = useCurrentUser();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [buyerPayoutNumber, setBuyerPayoutNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/invite/${inviteToken}`)
      .then((r) => r.json())
      .then(setInvite);
  }, [inviteToken]);

  // Penjual sendiri yang buka link ini -> redirect, tidak boleh join rekber sendiri
  useEffect(() => {
    if (invite && user && invite.sellerId === user.id) {
      navigate(`/rekber/${invite.orderCode}`);
    }
  }, [invite, user, navigate]);

  const breakdown = invite ? calculatePaymentBreakdown(Number(invite.amountIdr)) : null;

  async function handleJoin() {
    if (!inviteToken || !invite) return;
    if (buyerPayoutNumber.trim() === '') {
      setError('Nomor DANA wajib diisi untuk pencairan refund.');
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      const order = await request<{ orderCode: string }>(`/api/orders/invite/${inviteToken}/join`, {
        method: 'POST',
        body: JSON.stringify({ buyerPayoutChannel: 'DANA', buyerPayoutNumber }),
      });
      // Sesuai rencana: setelah join, langsung pindah ke /rekber/:orderCode -- di sana
      // panel bayar+sign ditampilkan (BuyerPaymentPanel dipakai ulang di RekberDetailPage),
      // supaya kalau tab ditutup & dibuka lagi lewat riwayat browser, tetap bisa lanjut.
      navigate(`/rekber/${order.orderCode}`);
    } catch (err) {
      // Mis. pembeli belum onboarding / order sudah diambil -- tampilkan pesan backend
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  }

  if (invite === null || !isAuthReady) {
    return (
      <Container width="narrow" className="pt-14">
        <Card className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </Container>
    );
  }

  if (!isLoggedIn) {
    return (
      <Container width="narrow" className="pt-14">
        <Card>
          <EmptyState
            title="Masuk dulu untuk lanjut"
            description="Kamu menerima undangan rekber. Masuk dengan email untuk melihat detail dan mengikutinya."
            action={
              <Button onClick={() => navigate('/login')}>Masuk ke Midtract</Button>
            }
          />
        </Card>
      </Container>
    );
  }

  if (!invite.canJoin) {
    return (
      <Container width="narrow" className="pt-14">
        <Card>
          <EmptyState
            icon={<LinkBreak size={22} weight="duotone" />}
            title="Rekber ini sudah tidak tersedia"
            description="Rekber sudah punya pembeli, sudah dimulai, atau telah ditutup. Minta link baru ke penjual bila perlu."
            action={
              <Link to="/dashboard">
                <Button variant="secondary" leftIcon={<ArrowLeft size={15} aria-hidden="true" />}>
                  Kembali ke Dashboard
                </Button>
              </Link>
            }
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container width="narrow" className="pt-10 pb-20 sm:pt-14">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-slate-900">{invite.productName}</h1>
        </div>
        {invite.productDescription && (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{invite.productDescription}</p>
        )}

        <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-slate-500">Nominal transaksi</dt>
            <dd className="font-medium text-slate-900">{formatIDR(Number(invite.amountIdr))}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-slate-500">Biaya layanan & QRIS</dt>
            <dd className="font-medium text-slate-900">{breakdown ? formatIDR(breakdown.totalIdr - Number(invite.amountIdr)) : '-'}</dd>
          </div>
          <div className="flex justify-between gap-4 bg-brand-50/50 px-4 py-3">
            <dt className="font-semibold text-slate-700">Total dibayar kamu</dt>
            <dd className="font-bold text-brand-800">{breakdown ? formatIDR(breakdown.totalIdr) : '-'}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <Field
            label="Nomor DANA (untuk pengembalian dana)"
            htmlFor="join-payout"
            error={error}
            helper="Dipakai bila transaksi dibatalkan dan danamu dikembalikan."
          >
            <TextInput
              id="join-payout"
              placeholder="08xxxxxxxxxx"
              inputMode="tel"
              value={buyerPayoutNumber}
              onChange={(e) => setBuyerPayoutNumber(e.target.value)}
              invalid={!!error}
            />
          </Field>
        </div>

        <Button className="mt-5" fullWidth onClick={handleJoin} loading={isJoining} disabled={buyerPayoutNumber.trim() === ''}>
          {isJoining ? 'Menyiapkan...' : 'Lanjutkan ke Pembayaran'}
        </Button>
      </Card>
    </Container>
  );
}