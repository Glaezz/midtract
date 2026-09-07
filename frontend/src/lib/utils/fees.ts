// Rincian biaya -- WAJIB konsisten dengan backend
// (backend/src/modules/payments/payments.service.ts -> calculateFees).
const PLATFORM_FEE_IDR = 1_000; // flat, sesuai PRD
const GATEWAY_FEE_RATE = 0.007; // 0,7% dari nominal produk (dibulatkan)

export function calculatePaymentBreakdown(amountIdr: number) {
  const platformFeeIdr = PLATFORM_FEE_IDR;
  const gatewayFeeIdr = Math.round(amountIdr * GATEWAY_FEE_RATE);
  const totalIdr = amountIdr + platformFeeIdr + gatewayFeeIdr;
  return { platformFeeIdr, gatewayFeeIdr, totalIdr };
}