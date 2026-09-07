import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  // Simpan elemen yang terfokus, numpuk fokus ke panel, lalu pulihkan saat tutup.
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Kunci scroll body selama modal terbuka supaya latar tidak ikut tergulung.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* jest: panel ref untuk fokus -- tabIndex -1 supaya tidak masuk urutan tab */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-float focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Tutup dialog"
              className="-mr-1 -mt-1 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}