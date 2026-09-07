import { Card } from '$lib/components/atoms/Card';
import { formatIDR } from '$lib/utils/format';

export function FinancialBreakdown({
  productPriceIdr,
  platformFeeIdr,
  gatewayFeeIdr,
  totalIdr,
  amountStablecoin,
  stablecoinRateUsed,
}: {
  productPriceIdr: number;
  platformFeeIdr: number;
  gatewayFeeIdr: number;
  totalIdr: number;
  amountStablecoin: string;
  stablecoinRateUsed: number;
}) {
  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Rincian Biaya</h2>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Nominal transaksi</span>
          <span>{formatIDR(productPriceIdr)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Biaya layanan platform</span>
          <span>{formatIDR(platformFeeIdr)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Biaya transaksi QRIS (0,7%)</span>
          <span>{formatIDR(gatewayFeeIdr)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
          <span>Total dibayar pembeli</span>
          <span>{formatIDR(totalIdr)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <div>
          <div className="text-slate-400">Rate acuan</div>
          <div className="mt-0.5 font-medium text-slate-800">Rp {stablecoinRateUsed.toLocaleString('id-ID')} / USDC</div>
        </div>
        <div>
          <div className="text-slate-400">Nilai terkunci di kontrak</div>
          <div className="mt-0.5 font-medium text-slate-800">{amountStablecoin} USDC</div>
        </div>
      </div>
    </Card>
  );
}