import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers, hardhatVerify],

  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    injectiveTestnet: {
      type: "http",                 // wajib di Hardhat 3
      chainType: "l1",
      url: "https://testnet.sentry.chain.json-rpc.injective.network/",
      chainId: 1439,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 120_000,
    },
  },

  // Hardhat 3 tidak mengenal chain 1439 — tanpa blok ini `hardhat verify` gagal
  chainDescriptors: {
    1439: {
      name: "Injective EVM Testnet",
      chainType: "l1",
      blockExplorers: {
        blockscout: {
          name: "Blockscout",
          url: "https://testnet.blockscout.injective.network",
          apiUrl: "https://testnet.blockscout-api.injective.network/api",
        },
      },
    },
  },

  verify: {
    blockscout: { enabled: true },
    etherscan: { enabled: false, apiKey: "" },
    sourcify: { enabled: false },
  },
});