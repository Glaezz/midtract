import { Package } from '@phosphor-icons/react';
import { Card } from '$lib/components/atoms/Card';

/** Cuma tampil kalau resi sudah diinput -- read-only, tidak perlu fungsional tracking beneran. */
export function CourierInfoCard({ courierName, courierReceiptNumber }: { courierName: string; courierReceiptNumber: string }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-50 text-info-700">
          <Package size={20} weight="duotone" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">Info Pengiriman</h2>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="shrink-0 text-slate-500">Ekspedisi</dt>
              <dd className="truncate font-medium text-slate-900">{courierName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="shrink-0 text-slate-500">No. resi</dt>
              <dd className="truncate font-mono font-medium text-slate-900">{courierReceiptNumber}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}