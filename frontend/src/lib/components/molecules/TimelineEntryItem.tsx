import { useState } from 'react';
import { ArrowRight, SquareHalfBottom, ArrowsDownUp } from '@phosphor-icons/react';
import { Modal } from '$lib/components/atoms/Modal';

export type TimelineEntry = {
  entryType: string;
  title: string;
  provider: string;
  description: string;
  from: string;
  to: string;
  amountDisplay: string;
  occurredAt: string;
  referenceLabel: string | null;
  referenceId: string | null;
  txHash: string | null;
  explorerUrl: string | null;
};

/** Baris ringkas -- panah arah dana LANGSUNG kelihatan tanpa perlu diklik. Klik -> buka modal detail. */
export function TimelineEntryItem({ entry }: { entry: TimelineEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <li className="border-b border-slate-100 py-3 last:border-0">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg px-2 py-1 text-left transition-colors hover:bg-slate-50"
          aria-label={`Detail ${entry.title}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-medium text-slate-800">{entry.title}</span>
            <span className="shrink-0 text-xs text-slate-400">{new Date(entry.occurredAt).toLocaleString('id-ID')}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="max-w-28 truncate">{entry.from}</span>
            <ArrowRight size={12} className="shrink-0 text-slate-300" aria-hidden="true" />
            <span className="max-w-28 truncate">{entry.to}</span>
          </div>
        </button>
      </li>

      <Modal open={open} onClose={() => setOpen(false)} title={entry.title}>
        <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
          <div className="min-w-0">
            <div className="text-slate-400">Dari</div>
            <div className="truncate font-medium text-slate-800">{entry.from}</div>
          </div>
          <ArrowRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
          <div className="min-w-0 text-right">
            <div className="text-slate-400">Ke</div>
            <div className="truncate font-medium text-slate-800">{entry.to}</div>
          </div>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Nominal</dt>
            <dd className="inline-flex items-center gap-1.5 font-medium text-slate-900">
              <ArrowsDownUp size={14} className="text-brand-600" aria-hidden="true" />
              {entry.amountDisplay}
            </dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Waktu</dt>
            <dd className="text-slate-700">{new Date(entry.occurredAt).toLocaleString('id-ID')}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Provider</dt>
            <dd className="flex items-center gap-1.5 text-slate-700">
              <SquareHalfBottom size={14} className="text-slate-400" aria-hidden="true" />
              {entry.provider}
            </dd>
          </div>

          {entry.txHash && entry.explorerUrl && (
            <div className="py-1.5">
              <div className="mb-1.5 text-slate-500">Hash transaksi</div>
              <a
                href={entry.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="block break-all rounded-lg border border-brand-100 bg-brand-50 p-2.5 font-mono text-xs text-brand-700 transition-colors hover:bg-brand-100"
              >
                {entry.txHash} ↗
              </a>
            </div>
          )}

          {entry.referenceId && (
            <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
              <dt className="text-slate-500">{entry.referenceLabel}</dt>
              <dd className="font-medium text-slate-900">{entry.referenceId}</dd>
            </div>
          )}
        </dl>

        {entry.description && (
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">{entry.description}</p>
        )}
      </Modal>
    </>
  );
}