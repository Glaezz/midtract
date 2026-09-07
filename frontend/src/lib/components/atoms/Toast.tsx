import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, Info, WarningCircle, X, XCircle } from '@phosphor-icons/react';

type ToastTone = 'success' | 'danger' | 'warning' | 'info';

type ToastItem = { id: number; tone: ToastTone; message: string };

type ToastApi = {
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const ICONS: Record<ToastTone, { Icon: typeof Info; color: string }> = {
  success: { Icon: CheckCircle, color: 'text-success-700' },
  danger: { Icon: XCircle, color: 'text-danger-700' },
  warning: { Icon: WarningCircle, color: 'text-warning-700' },
  info: { Icon: Info, color: 'text-info-700' },
};

// Fokus terlalu lama untuk pesan sukses; memungkinkan user baca, lalu lenyap.
const TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((t) => {
          const { Icon, color } = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-surface p-3.5 shadow-float"
            >
              <Icon size={20} weight="duotone" className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm text-slate-800">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Tutup"
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast hanya bisa dipakai di dalam <ToastProvider>.');
  return ctx;
}