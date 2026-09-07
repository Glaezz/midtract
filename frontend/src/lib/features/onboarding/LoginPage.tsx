import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ShieldCheck, EnvelopeSimple, LockKey } from '@phosphor-icons/react';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { Button } from '$lib/components/atoms/Button';
import { getAllowance } from '$lib/config/readOnlyContracts';

export function LoginPage() {
  const { ready, authenticated, user, login } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;

    getAllowance(user.wallet.address).then((allowance) => {
      // Threshold sederhana: allowance > 0 dianggap sudah pernah onboarding.
      navigate(allowance > 0n ? '/dashboard' : '/onboarding');
    });
  }, [ready, authenticated, user, navigate]);

  return (
    <Container width="narrow" className="pt-20 pb-16 sm:pt-28">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
          <ShieldCheck size={24} weight="fill" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Masuk ke Midtract
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Cukup pakai email. Wallet dan dana kamu diurus otomatis, terasa seperti rekber biasa.
        </p>
      </div>

      <Card className="mt-8">
        {!ready ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        ) : (
          <>
            <Button fullWidth size="lg" onClick={login} leftIcon={<EnvelopeSimple size={18} aria-hidden="true" />}>
              Lanjutkan dengan Email
            </Button>
            <ul className="mt-5 space-y-2 text-left text-xs leading-relaxed text-slate-500">
              <li className="flex items-start gap-2">
                <LockKey size={14} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                Dana pembeli dikunci kontrak otomatis, bukan disimpan pihak mana pun.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                Hanya kamu yang bisa melepas dana di luar skema otomatis, lewat konfirmasi penerimaan.
              </li>
            </ul>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400">
        Baru di Midtract?{' '}
        <Link to="/" className="font-medium text-brand-700 underline-offset-2 hover:underline">
          Lihat cara kerjanya dulu
        </Link>
      </p>
    </Container>
  );
}