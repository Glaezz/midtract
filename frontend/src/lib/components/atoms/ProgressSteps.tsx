import type { ReactNode } from 'react';
import { Check } from '@phosphor-icons/react';

export type ProgressStep = { label: string; icon?: ReactNode };

// Indikator fase order: langkah aktif = lingkaran brand, selesai = lingkaran
// brand dengan ceklis, belum → lingkaran abu.
export function ProgressSteps({
  steps,
  currentIndex,
  className = '',
}: {
  steps: ProgressStep[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <ol className={`flex items-start justify-between gap-1 ${className}`} aria-label="Kemajuan transaksi">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;

        return (
          <li key={step.label} className={`flex items-start ${isFirst ? '' : 'flex-1'}`}>
            {/* garis penghubung step sebelumnya */}
            {!isFirst && (
              <span
                className={`mt-[13px] mr-2 h-0.5 flex-1 -translate-x-2 rounded-full ${
                  isDone ? 'bg-brand-500' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
            )}
            <div className={`flex flex-col items-center ${isFirst ? '' : '-ml-2'} ${!isLast ? 'min-w-0 flex-1' : ''}`}>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone || isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
                aria-hidden="true"
              >
                {isDone ? <Check size={15} weight="bold" /> : <span className={isCurrent ? 'animate-pulse' : ''}>{i + 1}</span>}
              </span>
              <span className={`mt-1.5 hidden text-center text-[11px] font-medium leading-tight sm:block ${isCurrent ? 'text-brand-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mt-[13px] ml-2 h-0.5 min-w-2 flex-1 -translate-x-2 rounded-full ${isDone ? 'bg-brand-500' : 'bg-slate-200'}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}