import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { getAllowance } from '$lib/config/readOnlyContracts';

/**
 * Pasang di halaman yang butuh user sudah onboarding (allowance aktif) --
 * /rekber/new (bikin rekber sebagai penjual) dan halaman join/bayar (pembeli).
 * Kalau allowance masih 0, lempar ke /onboarding SEBELUM user buang waktu isi
 * form, bukan baru ketahuan gagal setelah submit.
 */
export function useRequireOnboarding() {
  const { ready, authenticated, user } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;
    getAllowance(user.wallet.address).then((allowance) => {
      if (allowance === 0n) navigate('/onboarding');
    });
  }, [ready, authenticated, user, navigate]);
}
