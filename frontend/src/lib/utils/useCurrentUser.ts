import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useApiClient } from '$lib/utils/apiClient';

export type CurrentUser = {
  id: string;
  privyDid: string;
  walletAddress: string;
  isAdmin: boolean;
};

/**
 * Dipakai di halaman mana pun yang perlu tahu "user yang login ini siapa" --
 * dibandingkan dengan order.sellerId/buyerId (dalam bentuk string, karena
 * BigInt sudah di-serialize jadi string oleh backend) untuk nentuin panel
 * aksi apa yang ditampilkan.
 */
export function useCurrentUser() {
  const { ready, authenticated } = usePrivy();
  const { request } = useApiClient();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    request<CurrentUser>('/api/users/me')
      .then(setUser)
      .catch(() => setUser(null)) // belum sync, wajar di detik-detik awal login
      .finally(() => setIsLoading(false));
  }, [ready, authenticated, request]);

  return {
    user,
    isLoading,
    isLoggedIn: authenticated,
    // Selama false, `isLoggedIn` BELUM bisa dipercaya -- Privy masih memulihkan
    // sesi (bisa dari local storage + verifikasi ke server mereka). Konsumen
    // hook ini WAJIB tunggu isAuthReady sebelum menampilkan pesan "belum login"
    // apa pun, kalau tidak user yang sebenarnya sudah login bakal lihat pesan
    // itu sekilas (atau lama, kalau sesi Privy lambat pulih) -- ini akar
    // penyebab kesan "logout sesaat" yang dilaporkan.
    isAuthReady: ready,
  };
}
