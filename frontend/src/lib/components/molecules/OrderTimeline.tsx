import { useEffect, useState } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { TimelineEntryItem, type TimelineEntry } from '$lib/components/molecules/TimelineEntryItem';
import { Card } from '$lib/components/atoms/Card';
import { Skeleton } from '$lib/components/atoms/Skeleton';

/** Zona B dari rencana halaman detail -- riwayat aliran dana, collapsed default per baris. */
export function OrderTimeline({ orderCode }: { orderCode: string }) {
  const [timeline, setTimeline] = useState<TimelineEntry[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderCode}/timeline`)
      .then((r) => r.json())
      .then(setTimeline);
  }, [orderCode]);

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Riwayat Aliran Dana</h2>
        {timeline && timeline.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <ArrowsClockwise size={13} aria-hidden="true" />
            {timeline.length} aktivitas
          </span>
        )}
      </div>

      {!timeline && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {timeline?.length === 0 && (
        <p className="text-sm text-slate-400">Belum ada aktivitas untuk rekber ini.</p>
      )}
      {timeline && timeline.length > 0 && (
        <ul>
          {timeline.map((entry, i) => (
            <TimelineEntryItem key={i} entry={entry} />
          ))}
        </ul>
      )}
    </Card>
  );
}