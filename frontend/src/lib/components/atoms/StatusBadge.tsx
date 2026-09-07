const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  FUNDING_IN_PROGRESS: 'Memproses Pembayaran', // status transien, biasanya cuma kelihatan sesaat
  WAITING_FOR_SIGNATURE: 'Menunggu Konfirmasi',
  LOCKED_IN_ESCROW: 'Dana Terkunci',
  IN_TRANSIT: 'Dalam Pengiriman',
  DELIVERED_CONFIRMED_BY_BUYER: 'Diterima Pembeli',
  DISPUTED: 'Sengketa',
  COMPLETED: 'Selesai',
  CANCELLED_REFUNDED: 'Dibatalkan/Refund',
  EXPIRED: 'Kedaluwarsa',
};

// Gaya soft (latar pastel + ring) yang lebih tenang khas fintech.
const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: 'bg-warning-50 text-warning-800 ring-warning-200',
  FUNDING_IN_PROGRESS: 'bg-warning-50 text-warning-800 ring-warning-200',
  WAITING_FOR_SIGNATURE: 'bg-info-50 text-info-800 ring-info-200',
  LOCKED_IN_ESCROW: 'bg-info-50 text-info-800 ring-info-200',
  IN_TRANSIT: 'bg-info-50 text-info-800 ring-info-200',
  DELIVERED_CONFIRMED_BY_BUYER: 'bg-success-50 text-success-800 ring-success-200',
  DISPUTED: 'bg-danger-50 text-danger-700 ring-danger-200',
  COMPLETED: 'bg-success-50 text-success-800 ring-success-200',
  CANCELLED_REFUNDED: 'bg-slate-100 text-slate-600 ring-slate-200',
  EXPIRED: 'bg-danger-50 text-danger-700 ring-danger-200',
};

const STATUS_DOT: Record<string, string> = {
  PENDING_PAYMENT: 'bg-warning-600',
  FUNDING_IN_PROGRESS: 'bg-warning-600',
  WAITING_FOR_SIGNATURE: 'bg-info-600',
  LOCKED_IN_ESCROW: 'bg-info-600',
  IN_TRANSIT: 'bg-info-600',
  DELIVERED_CONFIRMED_BY_BUYER: 'bg-success-600',
  DISPUTED: 'bg-danger-600',
  COMPLETED: 'bg-success-600',
  CANCELLED_REFUNDED: 'bg-slate-400',
  EXPIRED: 'bg-danger-600',
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  const dotClass = STATUS_DOT[status] ?? 'bg-slate-400';
  const label = STATUS_LABEL[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colorClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}