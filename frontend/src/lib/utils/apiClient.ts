import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** Ambil pesan yang bisa ditampilkan ke user dari error apa pun (mis. untuk alert). */
export function getUserFriendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === 'object' && 'error' in err.body) {
    return String((err.body as { error: unknown }).error);
  }
  return err instanceof Error ? err.message : String(err);
}

/**
 * Semua fetch ke backend yang butuh login HARUS lewat hook ini -- otomatis
 * ambil token sesi Privy (getAccessToken) dan pasang di header Authorization.
 * Endpoint publik (mis. GET detail order untuk Hero Section) boleh tetap pakai
 * fetch biasa, tapi lebih aman selalu lewat sini juga untuk konsistensi.
 */
export function useApiClient() {
  const { getAccessToken } = usePrivy();

  const request = useCallback(
    async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getAccessToken();

      const headers = new Headers(options.headers);
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new ApiError(res.status, errorBody);
      }

      if (res.status === 204) return undefined as T;
      return res.json() as Promise<T>;
    },
    [getAccessToken]
  );

  return { request };
}
