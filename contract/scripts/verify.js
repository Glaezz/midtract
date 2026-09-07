import { readFileSync } from "node:fs";
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre from "hardhat";

// Baca hasil deploy terakhir -- tidak perlu ketik ulang address/constructor args manual,
// dan otomatis konsisten dengan apa yang benar-benar di-deploy (lihat scripts/deploy.js).
const deployment = JSON.parse(readFileSync("../shared/deployments.json", "utf-8"));

console.log("Memverifikasi kontrak:", deployment.contractAddress);
console.log("Constructor args    :", [deployment.stablecoin, deployment.relayer, deployment.poolWallet]);

await verifyContract(
  {
    address: deployment.contractAddress,
    constructorArgs: [deployment.stablecoin, deployment.relayer, deployment.poolWallet],
    provider: "blockscout",
  },
  hre
);

console.log("Verifikasi selesai. Cek di:");
console.log(`https://testnet.blockscout.injective.network/address/${deployment.contractAddress}#code`);
