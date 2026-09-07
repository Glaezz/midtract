import { Prisma } from '@prisma/client';
/**
 * Express `res.json()` crash kalau ada `BigInt` di dalam objek (Prisma pakai BigInt
 * untuk semua kolom id/amount_idr, dst). Fungsi ini rekursif ubah semua BigInt jadi
 * string sebelum dikirim ke client. Pakai ini di SETIAP response yang datanya dari Prisma.
 *
 * Kolom `Decimal` (mis. amount_stablecoin) juga wajib dikonversi -- tanpa ini
 * object Decimal lolos mentah ke frontend dalam bentuk {s,e,d} dan bikin crash
 * render React / parseUnits di sisi klien.
 */
export function serializeBigInt(value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'object' && value !== null && Prisma.Decimal.isDecimal(value)) {
        // Decimal -> string supaya tetap presisi penuh (18,6), bukan float JS
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(serializeBigInt);
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serializeBigInt(v)]));
    }
    return value;
}
