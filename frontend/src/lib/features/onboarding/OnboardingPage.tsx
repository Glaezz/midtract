import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy, useSignTypedData } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { ArrowRight, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { buildPermitTypedData } from '$lib/utils/eip712';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { getPermitNonce, getAllowance, assertStablecoinDomainMatches } from '$lib/config/readOnlyContracts';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Alert } from '$lib/components/atoms/Alert';
import { Button } from '$lib/components/atoms/Button';
import { Field, TextInput } from '$lib/components/atoms/Field';
import { ProgressSteps } from '$lib/components/atoms/ProgressSteps';

// Allowance TERBATAS (bukan unlimited) -- lihat diskusi trade-off keamanan:
// infinite approve = risiko seluruh saldo tersedot kalau forwarder/relayer
// suatu saat di-exploit. Capped allowance membatasi kerugian maksimal.
const ONBOARDING_ALLOWANCE = ethers.parseUnits('500', 6); // 500 sUSDC

type CurrentUserProfile = { name: string | null; phoneNumber: string | null };

const STEPS = [
  { label: 'Profil' },
  { label: 'Izin' },
  { label: 'Aktifkan' },
];

export function OnboardingPage() {
  const { ready, authenticated, user } = usePrivy();
  const { signTypedData } = useSignTypedData();
  const { request } = useApiClient();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard: allowance sudah cukup -> tidak perlu onboarding lagi, lempar ke dashboard.
  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;
    getAllowance(user.wallet.address).then((allowance) => {
      if (allowance > 0n) navigate('/dashboard');
    });
  }, [ready, authenticated, user, navigate]);

  // Pre-fill nama & telepon KALAU sudah pernah diisi sebelumnya -- dicek dari data
  // profil (bukan dari allowance), karena nama/telepon tidak berubah walau allowance
  // habis lagi dan user perlu onboarding ulang.
  useEffect(() => {
    if (!ready || !authenticated) return;
    request<CurrentUserProfile>('/api/users/me')
      .then((profile) => {
        if (profile.name) setName(profile.name);
        if (profile.phoneNumber) setPhoneNumber(profile.phoneNumber);
      })
      .catch(() => {}); // wajar untuk user yang benar-benar baru, belum pernah sync
  }, [ready, authenticated, request]);

  async function handleActivate() {
    if (!user?.wallet?.address || !agreed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const nonce = await getPermitNonce(user.wallet.address);
      await assertStablecoinDomainMatches();

      const typedData = buildPermitTypedData(user.wallet.address, ONBOARDING_ALLOWANCE, nonce, deadline);
      const { signature } = await signTypedData(typedData);

      // Backend proses on-chain DULU, baru update nama+telepon kalau sukses.
      await request('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          userAddress: user.wallet.address,
          value: ONBOARDING_ALLOWANCE.toString(),
          deadline: deadline.toString(),
          signature,
          name: name || undefined,
          phoneNumber: phoneNumber || undefined,
        }),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container width="narrow" className="pt-10 pb-16 sm:pt-14">
      <ProgressSteps steps={STEPS} currentIndex={step} className="mb-8" />

      <Card>
        {step === 0 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Lengkapi profilmu</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Informasi ini hanya dipakai untuk menampilkan nama di transaksi dan menghubungi kamu bila ada kendala.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Nama" htmlFor="onboard-name">
                <TextInput
                  id="onboard-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  autoComplete="name"
                />
              </Field>
              <Field label="Nomor Telepon (opsional)" htmlFor="onboard-phone" optional helper="Dipakai untuk konfirmasi saat dana dilepas.">
                <TextInput
                  id="onboard-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(1)} rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Aktifkan pencairan otomatis</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Midtract butuh izin dari kamu untuk mengunci dan melepas dana sesuai skema rekber.
            </p>

            <div className="mt-5 space-y-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
              {[
                'Izin ini terbatas maksimal 500 sUSDC, bukan akses penuh ke saldomu.',
                'Bisa kamu cabut kapan saja dari pengaturan wallet.',
                'Tanpa izin ini, transaksi rekber tidak bisa diproses.',
              ].map((text) => (
                <p key={text} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                  {text}
                </p>
              ))}
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
              />
              <span>
                Saya mengerti dana yang terkunci akan dilepas otomatis sesuai aturan, tanpa persetujuan tambahan
                per transaksi. Saya setuju dengan izin pencairan yang dijelaskan di atas.
              </span>
            </label>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(0)} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
                Kembali
              </Button>
              <Button variant="secondary" disabled={!agreed} onClick={() => setStep(2)} rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Semua siap</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Terakhir, kami minta kamu menandatangani izin dengan wallet otomatis. Sekali klik, akun aktif.
            </p>

            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Nama</dt>
                <dd className="truncate font-medium text-slate-900">{name || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Telepon</dt>
                <dd className="truncate font-medium text-slate-900">{phoneNumber || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Izin pencairan</dt>
                <dd className="font-medium text-slate-900">Maks. 500 sUSDC</dd>
              </div>
            </dl>

            {error && <Alert tone="danger" title="Tidak bisa mengaktifkan akun" className="mt-4">{error}</Alert>}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
                Kembali
              </Button>
              <Button onClick={handleActivate} loading={isSubmitting} fullWidth className="sm:w-auto">
                {isSubmitting ? 'Mengaktifkan...' : 'Aktifkan Sekarang'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}