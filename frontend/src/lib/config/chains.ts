import { defineChain } from 'viem';

export const injectiveEvmTestnet = defineChain({
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.sentry.chain.json-rpc.injective.network/'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://testnet.blockscout.injective.network' },
  },
  testnet: true,
});
