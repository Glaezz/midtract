import { useEffect, useState } from 'react';
import { ClockCountdown } from '@phosphor-icons/react';

// Hitung mundur ke target waktu. Dipakai untuk tenggat bayar/sign/auto-release.
// @param target ISO string atau timestamp (boleh null → tidak ada tenggat).
export function useCountdown(target: string | null | undefined) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!target) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const secondsLeft = target ? Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000)) : null;

  return { secondsLeft, expired: secondsLeft !== null && secondsLeft <= 0 };
}

export function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h} jam ${m} menit`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
}

export function Countdown({
  target,
  className = '',
  label = '',
}: {
  target: string | null | undefined;
  className?: string;
  label?: string;
}) {
  const { secondsLeft, expired } = useCountdown(target);

  if (secondsLeft === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${expired ? 'text-danger-600' : 'text-brand-700'} ${className}`}
      role="timer"
      aria-live="off"
    >
      <ClockCountdown size={16} weight="duotone" aria-hidden="true" />
      {label && <span className="font-normal text-slate-500">{label}</span>}
      {expired ? 'Waktu habis' : formatCountdown(secondsLeft)}
    </span>
  );
}