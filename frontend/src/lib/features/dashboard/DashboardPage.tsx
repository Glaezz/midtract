import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBagOpen, Storefront } from '@phosphor-icons/react';
import { useApiClient } from '$lib/utils/apiClient';
import { Container } from '$lib/components/atoms/Container';
import { Button } from '$lib/components/atoms/Button';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { EmptyState } from '$lib/components/atoms/EmptyState';
import { StatusBadge } from '$lib/components/atoms/StatusBadge';
import { formatIDR } from '$lib/utils/format';

type OrderSummary = {
  orderCode: string;
  productName: string;
  amountIdr: string;
  status: string;
};

function OrderListSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-slate-200/80 bg-surface shadow-card">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { request } = useApiClient();
  const [tab, setTab] = useState<'seller' | 'buyer'>('seller');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    request<OrderSummary[]>(`/api/orders?role=${tab}`)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [tab, request]);

  const isBuyer = tab === 'buyer';

  return (
    <Container width="default" className="pt-10 pb-20 sm:pt-14">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rekberku</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau transaksi kamu dalam satu tempat.</p>
        </div>
        <Link to="/rekber/new">
          <Button leftIcon={<Plus size={16} aria-hidden="true" />}>Buat Rekber</Button>
        </Link>
      </div>

      {/* Segmented control */}
      <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1" role="tablist" aria-label="Filter peran">
        {(
          [
            { value: 'seller', label: 'Sebagai Penjual', icon: Storefront },
            { value: 'buyer', label: 'Sebagai Pembeli', icon: ShoppingBagOpen },
          ] as const
        ).map(({ value, label, icon: Icon }) => {
          const active = tab === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-surface text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <OrderListSkeleton />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Storefront size={22} weight="duotone" />}
            title={isBuyer ? 'Belum ada rekber sebagai pembeli' : 'Belum ada rekber sebagai penjual'}
            description={
              isBuyer
                ? 'Link undangan yang kamu ikuti akan muncul di sini. Minta link rekber ke penjual untuk memulai.'
                : 'Buat rekber pertama, bagikan linknya ke pembeli, dan transaksi bisa segera dimulai.'
            }
            action={
              !isBuyer ? (
                <Link to="/rekber/new">
                  <Button leftIcon={<Plus size={16} aria-hidden="true" />}>Buat Rekber</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-slate-200/80 bg-surface shadow-card">
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => (
                <li key={order.orderCode}>
                  <Link
                    to={`/rekber/${order.orderCode}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors motion-safe:hover:bg-brand-50/30 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{order.productName}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{formatIDR(Number(order.amountIdr))}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Container>
  );
}