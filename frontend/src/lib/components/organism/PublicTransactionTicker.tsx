import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pulse } from '@phosphor-icons/react';
import { Card } from '$lib/components/atoms/Card';
import { StatusBadge } from '$lib/components/atoms/StatusBadge';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { formatIDR, formatAddress } from '$lib/utils/format';

type RecentOrder = {
  orderCode: string;
  productName: string;
  amountIdr: string;
  status: string;
  sellerWallet: string;
  buyerWallet: string | null;
  updatedAt: string;
};

function TickerSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Fitur transparansi Hero Section -- beberapa transaksi publik terbaru. */
export function PublicTransactionTicker() {
  const [orders, setOrders] = useState<RecentOrder[] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/recent?limit=10`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setHasLoaded(true);
      })
      .catch(() => setHasLoaded(true)); // backend mati / di luar skill -- tetap tandai selesai memuat
  }, []);

  return (
    <div className="text-left">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-500">Transaksi Terbaru</h2>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600">
          <Pulse size={14} weight="fill" aria-hidden="true" />
          Langsung dari kontrak
        </span>
      </div>

      {!hasLoaded ? (
        <TickerSkeleton />
      ) : orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {orders.map((order) => (
            <Link key={order.orderCode} to={`/rekber/${order.orderCode}`}>
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-brand-300 hover:bg-brand-50/30">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{order.productName}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    {formatAddress(order.sellerWallet)}
                    {order.buyerWallet && <span className="text-slate-300"> → </span>}
                    {order.buyerWallet && formatAddress(order.buyerWallet)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-sm font-semibold text-slate-900">{formatIDR(Number(order.amountIdr))}</p>
                  <StatusBadge status={order.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}

      {hasLoaded && orders && orders.length === 0 && (
        <p className="rounded-card border border-dashed border-slate-300 bg-surface/60 px-6 py-8 text-center text-sm text-slate-500">
          Belum ada transaksi publik. Jadilah yang pertama membuat rekber.
        </p>
      )}
    </div>
  );
}