import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Midtract -- dipakai FE & BE sungguhan, wajib ada di shared/abi/
const { abi } = JSON.parse(
  readFileSync("artifacts/contracts/Midtract.sol/Midtract.json", "utf8")
);

const tujuan = "../shared/abi/Midtract.json";
mkdirSync(tujuan.slice(0, tujuan.lastIndexOf("/")), { recursive: true });
writeFileSync(tujuan, JSON.stringify(abi, null, 2) + "\n");

console.log(`ABI Midtract (${abi.length} entri) disalin ke ${tujuan}`);

// MockUSDCPermit TIDAK ikut diekspor ke shared/ -- itu cuma dipakai
// Midtract.test.js untuk testing lokal, tidak pernah di-deploy ke testnet.
// Frontend/backend produksi connect ke alamat USDC ASLI dari Circle,
