const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr';
const BACKUP_FIAT_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_IDR_RATE = 15800;
export class RateFetchError extends Error {
}
/**
 * Fetch dengan Timeout 10 Detik
 */
async function fetchWithTimeout(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
        });
        return response;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
/**
 * Ambil rate USDC/IDR dari CoinGecko (Primary) atau Open ExchangeRate (Backup)
 */
export async function getUsdcToIdrRate(maxRetries = 2) {
    // 1. Coba Panggil CoinGecko (Primary)
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(COINGECKO_URL, 10000); // Waktu diperpanjang jadi 10s
            if (!response.ok) {
                throw new Error(`HTTP Status ${response.status}`);
            }
            const body = (await response.json());
            const rate = body?.['usd-coin']?.idr;
            if (rate && !Number.isNaN(rate) && rate > 0) {
                return Math.round(rate);
            }
        }
        catch (err) {
            console.warn(`[CoinGecko RateFetch] Percobaan ${attempt}/${maxRetries} gagal: ${err.message}`);
            if (attempt < maxRetries) {
                await new Promise((res) => setTimeout(res, 1000));
            }
        }
    }
    // 2. Jika CoinGecko Timeout / Gagal, Coba Panggil API Cadangan (Open ExchangeRate API)
    try {
        console.warn('[RateFetch] Mencoba API Cadangan (open.er-api.com)...');
        const backupRes = await fetchWithTimeout(BACKUP_FIAT_URL, 8000);
        if (backupRes.ok) {
            const backupBody = (await backupRes.json());
            const backupRate = backupBody?.rates?.IDR;
            if (backupRate && !Number.isNaN(backupRate) && backupRate > 0) {
                console.log(`[RateFetch] Berhasil mengambil rate dari API Cadangan: ${backupRate}`);
                return Math.round(backupRate);
            }
        }
    }
    catch (backupErr) {
        console.error(`[RateFetch] API Cadangan juga gagal: ${backupErr.message}`);
    }
    // 3. Cadangan Terakhir (Fallback Fix Rate)
    console.error(`[RateFetch] Menggunakan Fallback Rate (${FALLBACK_IDR_RATE})`);
    return FALLBACK_IDR_RATE;
}
