import { useEffect, useState } from 'react';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
      hide?: () => void;
    };
  }
}

const SNAP_SCRIPT_URL = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

// Singleton promise di level module -- snap.js WAJIB cuma dieksekusi SEKALI
// seumur aplikasi. Kalau dimuat dobel (mis. StrictMode mount-unmount-mount),
// dua instance Snap saling rebutan kontrol popup dan pay() ke-2 gagal
// ("inline script violates CSP" + popup baru muncul setelah ~5 menit timeout).
let snapLoadPromise: Promise<void> | null = null;

function loadSnapOnce(): Promise<void> {
  if (window.snap) return Promise.resolve();
  if (snapLoadPromise) return snapLoadPromise;

  snapLoadPromise = new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = SNAP_SCRIPT_URL;
    script.async = true;
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    // Sengaja TIDAK di-remove dari DOM saat component unmount -- menghapus
    // node tidak membatalkan eksekusi yang sudah jalan, malah bikin state
    // window.snap yatim. Biarkan terpasang selama aplikasi hidup.
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  return snapLoadPromise;
}

/** Muat script Snap.js sekali, dipakai untuk munculin pop-up window.snap.pay(). */
export function useSnapScript() {
  const [isLoaded, setIsLoaded] = useState(!!window.snap);

  useEffect(() => {
    if (window.snap) {
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    loadSnapOnce().then(() => {
      if (!cancelled) setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isLoaded };
}
