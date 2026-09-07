import { Card } from '$lib/components/atoms/Card';
import { formatAddress } from '$lib/utils/format';

type Party = {
  name: string | null;
  email: string;
  phoneNumber: string | null;
  walletAddress: string;
};

function PartyCard({ label, party, payoutChannel, payoutNumber }: {
  label: string;
  party: Party;
  payoutChannel: string;
  payoutNumber: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
          {(party.name ?? '?').slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
          <div className="truncate text-sm font-medium text-slate-900">{party.name ?? '(nama belum diisi)'}</div>
        </div>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-slate-500">
        <div className="flex justify-between gap-3">
          <dt className="shrink-0">Email</dt>
          <dd className="truncate text-slate-700">{party.email}</dd>
        </div>
        {party.phoneNumber && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0">Telepon</dt>
            <dd className="truncate text-slate-700">{party.phoneNumber}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="shrink-0">Wallet</dt>
          <dd className="font-mono text-slate-700">{formatAddress(party.walletAddress)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="shrink-0">{payoutChannel}</dt>
          <dd className="truncate font-medium text-slate-700">{payoutNumber}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Data yang masuk sini SUDAH tersensor dari backend (getOrderDetail) -- tidak ada sensor tambahan di sini. */
export function OrderParticipants({ seller, buyer, sellerPayoutChannel, sellerPayoutNumber, buyerPayoutChannel, buyerPayoutNumber }: {
  seller: Party;
  buyer: Party | null;
  sellerPayoutChannel: string;
  sellerPayoutNumber: string;
  buyerPayoutChannel: string | null;
  buyerPayoutNumber: string | null;
}) {
  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Pihak Transaksi</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PartyCard label="Penjual" party={seller} payoutChannel={sellerPayoutChannel} payoutNumber={sellerPayoutNumber} />
        {buyer ? (
          <PartyCard label="Pembeli" party={buyer} payoutChannel={buyerPayoutChannel ?? '-'} payoutNumber={buyerPayoutNumber ?? '-'} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
            Belum ada pembeli, tunggu link undangan diikuti.
          </div>
        )}
      </div>
    </Card>
  );
}