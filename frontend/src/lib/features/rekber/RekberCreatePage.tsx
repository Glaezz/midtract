import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info } from '@phosphor-icons/react';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { useRequireOnboarding } from '$lib/utils/useRequireOnboarding';
import { calculatePaymentBreakdown } from '$lib/utils/fees';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Alert } from '$lib/components/atoms/Alert';
import { Button } from '$lib/components/atoms/Button';
import { Field, TextInput, TextArea } from '$lib/components/atoms/Field';
import { ProgressSteps } from '$lib/components/atoms/ProgressSteps';
import { formatIDR } from '$lib/utils/format';
import { getUsdcToIdrRate } from '$lib/utils/rate';

type Order = { orderCode: string };

const STEPS = [
  { label: 'Produk' },
  { label: 'Pembayaran' },
  { label: 'Konfirmasi' },
];

export function RekberCreatePage() {
  const { allowance } = useRequireOnboarding();

  const [step, setStep] = useState(0);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [amountIdr, setAmountIdr] = useState('');
  const [sellerPayoutNumber, setSellerPayoutNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stableCoinRate, setStableCoinRate] = useState<number | null>(null);
  const { request } = useApiClient();
  const navigate = useNavigate();

  useEffect(() => {
    getUsdcToIdrRate().then(setStableCoinRate);
  }, []);

  const parsedAmount = amountIdr.trim() === '' ? 0 : Number(amountIdr);
  const breakdown = parsedAmount > 0 ? calculatePaymentBreakdown(parsedAmount) : null;

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (productName.trim().length < 3) e.productName = 'Nama produk minimal 3 karakter.';
    } else if (s === 1) {
      if (!(parsedAmount > 0)) e.amountIdr = 'Isi nominal lebih dari 0.';
      if (sellerPayoutNumber.trim() === '') e.sellerPayoutNumber = 'Nomor DANA wajib diisi untuk pencairan.';
    }
    return e;
  }

  function goNext() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setStep(step + 1);
  }

  function goBack() {
    setErrors({});
    setStep(step - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Validasi allowance sebelum submit
    if (allowance === null) {
      setSubmitError('Gagal memuat data wallet. Coba muat ulang halaman.');
      return;
    }

    if (stableCoinRate === null) {
      setSubmitError('Gagal memuat nilai tukar. Coba muat ulang halaman.');
      return;
    }

    const requiredAllowance = BigInt(Math.ceil(parsedAmount / stableCoinRate * 1_000_000));

    if (allowance < requiredAllowance) {
      const allowanceIdr = Number(allowance) * stableCoinRate / 1_000_000;
      setSubmitError(
        `Allowance wallet kamu (${formatIDR(Math.floor(allowanceIdr))}) tidak mencukupi untuk nominal ini (${formatIDR(parsedAmount)}). ` +
        `Silakan naikkan allowance di halaman (${<Link to="/onboarding" className="underline">onboarding</Link>}) terlebih dahulu.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          productName,
          productDescription: productDescription || undefined,
          amountIdr: parsedAmount,
          sellerPayoutChannel: 'DANA',
          sellerPayoutNumber,
        }),
      });
      navigate(`/rekber/${order.orderCode}`);
    } catch (err) {
      setSubmitError(getUserFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const step0Valid = productName.trim().length >= 3;
  const step1Valid = parsedAmount > 0 && sellerPayoutNumber.trim() !== '';

  return (
    <Container width="narrow" className="pt-10 pb-20 sm:pt-14">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Rekber</h1>
        <p className="my-1 text-sm text-slate-500">
          Isi detail transaksi, lalu bagikan link undangan ke pembeli.
        </p>
      </div>

      <ProgressSteps steps={STEPS} currentIndex={step} className="mb-8 mt-4" />

      <Card>
        {/* Tahap 0: Produk */}
        {step === 0 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Detail produk</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Sebutkan nama barang atau jasa yang ditransaksikan. Deskripsi bersifat opsional.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Nama Produk" htmlFor="create-product" error={errors.productName}>
                <TextInput
                  id="create-product"
                  placeholder="Mis. Sepatu Nike Air Force 1"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  invalid={!!errors.productName}
                />
              </Field>
              <Field label="Deskripsi" htmlFor="create-desc" optional helper="Kondisi, ukuran, atau detail lain yang penting untuk pembeli.">
                <TextArea
                  id="create-desc"
                  rows={3}
                  placeholder="Kondisi, ukuran, dsb."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={goNext} disabled={!step0Valid} rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {/* Tahap 1: Pembayaran */}
        {step === 1 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Detail pembayaran</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Masukkan nominal transaksi dan nomor DANA tujuan pencairan.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Nominal Transaksi (IDR)" htmlFor="create-amount" error={errors.amountIdr} prefix="Rp">
                <TextInput
                  id="create-amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="500000"
                  className="pl-9"
                  value={amountIdr}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '');
                    if (digits.length <= 12) setAmountIdr(digits);
                  }}
                  invalid={!!errors.amountIdr}
                />
              </Field>

              {breakdown && (
                <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                  <div className="flex items-start gap-2 text-slate-500">
                    <Info size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <span>Pembeli membayar nominal transaksi + biaya layanan berikut:</span>
                  </div>
                  <div className="mt-2 space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Nominal transaksi</span>
                      <span className="font-medium text-slate-800">{formatIDR(parsedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya layanan platform</span>
                      <span className="font-medium text-slate-800">{formatIDR(breakdown.platformFeeIdr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya transaksi QRIS (0,7%)</span>
                      <span className="font-medium text-slate-800">{formatIDR(breakdown.gatewayFeeIdr)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                    <span>Total dibayar pembeli</span>
                    <span>{formatIDR(breakdown.totalIdr)}</span>
                  </div>
                </div>
              )}

              {allowance !== null && stableCoinRate !== null && (() => {
                const allowanceIdr = Number(allowance) * stableCoinRate / 1_000_000;
                const isExceeded = parsedAmount > 0 && parsedAmount > Math.floor(allowanceIdr);
                return (
                  <div className={`rounded-xl border p-3 text-xs ${isExceeded ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-50/70 text-slate-500'}`}>
                    <span className="font-medium">Allowance wallet:</span> {formatIDR(Math.floor(allowanceIdr))}
                    {isExceeded && (
                      <span className="block mt-1 text-amber-700">
                        Nominal melebihi allowance. Silakan naikkan allowance di halaman onboarding.
                      </span>
                    )}
                  </div>
                );
              })()}

              <Field
                label="Nomor DANA (tujuan pencairan)"
                htmlFor="create-payout"
                error={errors.sellerPayoutNumber}
                helper="Dana yang sudah dilepas ditransfer ke nomor DANA ini."
              >
                <TextInput
                  id="create-payout"
                  placeholder="08123456789"
                  inputMode="tel"
                  value={sellerPayoutNumber}
                  onChange={(e) => setSellerPayoutNumber(e.target.value)}
                  invalid={!!errors.sellerPayoutNumber}
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={goBack} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
                Kembali
              </Button>
              <Button variant="secondary" disabled={!step1Valid} onClick={goNext} rightIcon={<ArrowRight size={16} aria-hidden="true" />}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {/* Tahap 2: Konfirmasi */}
        {step === 2 && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">Konfirmasi rekber</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Pastikan semua data sudah benar sebelum membuat link rekber.
            </p>

            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Nama Produk</dt>
                <dd className="truncate text-right font-medium text-slate-900">{productName}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Deskripsi</dt>
                <dd className="truncate text-right font-medium text-slate-900">{productDescription || '-'}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Nominal Transaksi</dt>
                <dd className="font-medium text-slate-900">{formatIDR(parsedAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Biaya layanan platform</dt>
                <dd className="font-medium text-slate-900">{formatIDR(breakdown?.platformFeeIdr ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Biaya transaksi QRIS (0,7%)</dt>
                <dd className="font-medium text-slate-900">{formatIDR(breakdown?.gatewayFeeIdr ?? 0)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Total dibayar pembeli</dt>
                <dd className="font-semibold text-slate-900">{formatIDR(breakdown?.totalIdr ?? parsedAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500">Nomor DANA</dt>
                <dd className="font-medium text-slate-900">{sellerPayoutNumber}</dd>
              </div>
            </dl>

            {submitError && (
              <Alert tone="danger" title="Rekber gagal dibuat" className="mt-4">
                {submitError}
              </Alert>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={goBack} disabled={isSubmitting} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
                Kembali
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting} fullWidth className="sm:w-auto">
                {isSubmitting ? 'Membuat...' : 'Buat Link Rekber'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}
