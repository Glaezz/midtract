import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useApiClient } from '$lib/utils/apiClient';

/**
 * Dipasang sekali di root App -- begitu user selesai login lewat Privy, otomatis
 * panggil POST /api/users/sync supaya baris di tabel users ke-buat/ter-update.
 * TANPA INI, order.sellerId/buyerId tidak akan pernah bisa di-resolve di backend,
 * karena tidak ada baris user yang cocok dengan privyDid manapun.
 */
export function useSyncUser() {
  const { ready, authenticated, user } = usePrivy();
  const { request } = useApiClient();
  const syncedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address || !user.email?.address) return;
    if (syncedForUserId.current === user.id) return; // jangan sync berulang-ulang tiap render

    request('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email.address,
        walletAddress: user.wallet.address,
        name: undefined,
      }),
    })
      .then(() => {
        syncedForUserId.current = user.id;
      })
      .catch((err) => {
        console.error('Gagal sync user ke backend:', err);
      });
  }, [ready, authenticated, user, request]);
}
