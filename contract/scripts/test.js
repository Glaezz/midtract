import { writeFileSync } from "node:fs";    

const stablecoin = process.env.STABLECOIN_ADDRESS;
const relayer = process.env.RELAYER_ADDRESS;
const poolWallet = process.env.POOL_WALLET_ADDRESS;

writeFileSync(
  "../shared/deployments.json",
  JSON.stringify(
    { network: "injectiveTestnet", chainId: 1439, contractAddress: "0x64BA1E14630E2BefC3C5B1e0f1a80b30801D5CC5", deployTxHash: 0x72d1d15a65754ac23922ecbb8380d624a0625094a1b172d647a1d7f703d76117, stablecoin, relayer, poolWallet },
    null,
    2
  ) + "\n"
);
