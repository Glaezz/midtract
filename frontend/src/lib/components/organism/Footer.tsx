import { Link } from 'react-router-dom';
import { ShieldCheck } from '@phosphor-icons/react';
import { Container } from '$lib/components/atoms/Container';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/70 bg-surface">
      <Container width="wide" className="flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck size={13} weight="fill" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-slate-900">Midtract</p>
          <span className="hidden text-xs text-slate-400 sm:inline">&middot;</span>
          <p className="hidden text-xs text-slate-500 sm:inline">
            Rekber digital, dana dikunci kontrak otomatis, dilepas saat barang diterima.
          </p>
        </div>

        <Link to="/dashboard" className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline">
          Mulai Rekber &rarr;
        </Link>
      </Container>
    </footer>
  );
}