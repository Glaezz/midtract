import { useEffect, useState } from 'react';
import { useApiClient, getUserFriendlyErrorMessage } from '$lib/utils/apiClient';
import { useCurrentUser } from '$lib/utils/useCurrentUser';
import { useToast } from '$lib/components/atoms/Toast';
import { Container } from '$lib/components/atoms/Container';
import { Card } from '$lib/components/atoms/Card';
import { Alert } from '$lib/components/atoms/Alert';
import { Button } from '$lib/components/atoms/Button';
import { Skeleton } from '$lib/components/atoms/Skeleton';
import { EmptyState } from '$lib/components/atoms/EmptyState';
import { Field, TextArea } from '$lib/components/atoms/Field';
import { ConfirmDialog } from '$lib/components/atoms/ConfirmDialog';
import { StatusBadge } from '$lib/components/atoms/StatusBadge';
import { formatIDR, formatAddress } from '$lib/utils/format';

type DisputedOrder = {
  orderCode: string;
  productName: string;
  amountIdr: string;
  disputeReason: string | null;
  seller: { walletAddress: string };
  buyer: { walletAddress: string } | null;
};

type Decision = 'RELEASE_TO_SELLER' | 'REFUND_TO_BUYER';

const DECISION_LABEL: Record<Decision, string> = {
  RELEASE_TO_SELLER: 'Menangkan Penjual (lepas dana)',
  REFUND_TO_BUYER: 'Menangkan Pembeli (refund dana)',
};

export function AdminDisputesPage() {
  const { request } = useApiClient();
  const { user, isLoading } = useCurrentUser();
  const { show } = useToast();
  const [disputes, setDisputes] = useState<DisputedOrder[]>([]);
  const [pendingAction, setPendingAction] = useState<{ orderCode: string; decision: Decision; productName: string } | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  async function refresh() {
    const data = await request<DisputedOrder[]>('/api/disputes');
    setDisputes(data);
  }

  useEffect(() => {
    if (user?.isAdmin) refresh();
  }, [user]);

  async function handleConfirmResolve() {
    if (!pendingAction) return;
    if (note.trim().length < 10) {
      setNoteError('Catatan audit minimal 10 karakter. Ini dilaporkan ke kedua pihak.');
      return;
    }

    setIsResolving(true);
    try {
      await request(`/api/disputes/${pendingAction.orderCode}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ decision: pendingAction.decision, description: note }),
      });
      setPendingAction(null);
      setNote('');
      show(`${pendingAction.productName} ditutup sesuai keputusan.`, 'success');
      await refresh();
    } catch (err) {
      show(getUserFriendlyErrorMessage(err), 'danger');
    } finally {
      setIsResolving(false);
    }
  }

  if (isLoading) {
    return (
      <Container width="default" className="pt-10">
        <Skeleton className="h-8 w-64" />
        <Card className="mt-6 space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-72" />
        </Card>
      </Container>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Container width="default" className="pt-10">
        <Card>
          <EmptyState
            title="Halaman ini khusus admin"
            description="Kamu tidak punya akses ke panel sengketa. Hubungi admin bila kamu rasa ini keliru."
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container width="default" className="pt-10 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel Sengketa</h1>
        <p className="mt-1 text-sm text-slate-500">Tinjau dan selesaikan sengketa dari pembeli & penjual.</p>
      </div>

      {disputes.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Tidak ada sengketa aktif" description="Semua transaksi berjalan lancar. Sengketa baru akan muncul di sini." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {disputes.map((d) => (
            <Card key={d.orderCode}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{d.productName}</h2>
                    <StatusBadge status="DISPUTED" />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{formatIDR(Number(d.amountIdr))}</p>
                </div>
              </div>

              <p className="mt-3 rounded-xl border border-warning-100 bg-warning-50 p-3 text-sm text-slate-700">
                <span className="font-medium">Alasan sengketa:</span> {d.disputeReason ?? '-'}
              </p>

              <p className="mt-3 font-mono text-xs text-slate-400">
                Penjual: {formatAddress(d.seller.walletAddress)}
                {d.buyer ? ` · Pembeli: ${formatAddress(d.buyer.walletAddress)}` : ''}
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNote('');
                    setNoteError(null);
                    setPendingAction({ orderCode: d.orderCode, decision: 'RELEASE_TO_SELLER', productName: d.productName });
                  }}
                >
                  Menangkan Penjual
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setNote('');
                    setNoteError(null);
                    setPendingAction({ orderCode: d.orderCode, decision: 'REFUND_TO_BUYER', productName: d.productName });
                  }}
                >
                  Menangkan Pembeli
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        onClose={() => !isResolving && setPendingAction(null)}
        title="Selesaikan sengketa?"
        confirmLabel="Simpan Keputusan"
        confirmVariant="primary"
        busy={isResolving}
        onConfirm={handleConfirmResolve}
      >
        <Alert tone="warning" title={pendingAction ? DECISION_LABEL[pendingAction.decision] : ''}>
          Keputusan ini melepas dana <b>secara permanen</b> ke tujuan yang dipilih dan tidak bisa dibatalkan.
          Isi catatan audit sebagai dasar keputusan untuk kedua pihak.
        </Alert>
        <div className="mt-4">
          <Field label="Catatan audit" htmlFor="resolve-note" error={noteError}>
            <TextArea
              id="resolve-note"
              rows={3}
              placeholder="Mis. pembeli menunjukkan bukti barang tidak sesuai (foto/chat)"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteError(null);
              }}
            />
          </Field>
        </div>
      </ConfirmDialog>
    </Container>
  );
}