export function formatIDR(amount: number | bigint): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount));
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`; // sensor untuk Hero Section publik
}
