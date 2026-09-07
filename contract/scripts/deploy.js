import { network } from "hardhat";
import { writeFileSync } from "node:fs";

// Hardhat 3: tidak ada `hre.ethers` global. `getOrCreate()` tanpa argumen
// memakai jaringan yang dipilih lewat flag `--network`.
const { ethers, networkName } = await network.getOrCreate();

const [deployer] = await ethers.getSigners();
if (deployer === undefined) {
  throw new Error("Tidak ada signer -- cek PRIVATE_KEY di .env");
}

console.log("Jaringan   :", networkName);

const saldo = await ethers.provider.getBalance(deployer.address);
console.log("Saldo      :", ethers.formatEther(saldo), "INJ");

if (saldo === 0n) {
  throw new Error("Saldo 0 INJ -- ambil dulu di https://testnet.faucet.injective.network/");
}

const stablecoin = process.env.STABLECOIN_ADDRESS;
const relayer = process.env.RELAYER_ADDRESS;
const poolWallet = process.env.POOL_WALLET_ADDRESS;

if (!stablecoin || !relayer || !poolWallet) {
  throw new Error("Isi STABLECOIN_ADDRESS, RELAYER_ADDRESS, POOL_WALLET_ADDRESS di .env dulu");
}

const Factory = await ethers.getContractFactory("Midtract");
const contract = await Factory.deploy(stablecoin, relayer, poolWallet);
await contract.waitForDeployment();

const contractAddress = await contract.getAddress();
const deployTxHash = contract.deploymentTransaction()?.hash;

console.log("Midtract deployed at:", contractAddress);
console.log("Deploy tx hash    :", deployTxHash);
console.log("Explorer          : https://testnet.blockscout.injective.network/address/" + contractAddress);

// Simpan supaya frontend & backend tidak perlu copy-paste alamat manual --
// satu sumber kebenaran, konsisten dengan konvensi shared/ di monorepo ini.
writeFileSync(
  "../shared/deployments.json",
  JSON.stringify(
    { network: networkName, chainId: 1439, contractAddress, deployTxHash, stablecoin, relayer, poolWallet },
    null,
    2
  ) + "\n"
);
