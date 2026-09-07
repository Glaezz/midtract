import { LockSimple } from '@phosphor-icons/react';
import { Card } from '$lib/components/atoms/Card';
import { Countdown } from '$lib/components/atoms/Countdown';

/** Muncul saat LOCKED_IN_ESCROW/IN_TRANSIT -- jelaskan dana terkunci + tenggat AUTO-RELEASE (bukan tenggat sign). */
export function LockStatusCard({ autoReleaseAt }: { autoReleaseAt: string | null }) {
  const target = autoReleaseAt
    ? new Date(autoReleaseAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <Card tone="tint">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <LockSimple size={20} weight="fill" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Dana terkunci di kontrak otomatis</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Dana pembeli aman di kontrak <span className="font-mono font-semibold">Midtract</span> dan tidak bisa
            diambil sepihak oleh siapa pun, termasuk platform ini. Dana dilepas otomatis ke penjual bila pembeli
            tidak mengonfirmasi barang atau mengajukan sengketa sampai batas waktu:
          </p>
          {autoReleaseAt && (
            <div className="mt-2">
              {/* teks utama tetap waktu lokal; rincian tenggat dengan hitung mundur */}
              <p className="text-sm font-semibold text-brand-800">
                {target}
                <Countdown target={autoReleaseAt} className="ml-2 align-middle text-xs" label="Auto-release:" />
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}