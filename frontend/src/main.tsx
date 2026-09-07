import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';
import { injectiveEvmTestnet } from '$lib/config/chains';
import { ToastProvider } from '$lib/components/atoms/Toast';
import './app.css';

// JSON standar tidak bisa serialize bigint -- tanpa patch ini, JSON.stringify
// internal library (Privy mengirim typedData EIP-712 ke iframe wallet) melempar
// "Do not know how to serialize a BigInt" saat user sign permit/lock.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['email'],
        embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
        // Chain 1439 tidak didukung Coinbase Smart Wallet -- paksa mode EOA
        // (ekstensi browser) supaya konektor ini tidak komplain soal chain.
        externalWallets: {
          coinbaseWallet: {
            config: { preference: { options: 'eoaOnly' } },
          },
        },
        defaultChain: injectiveEvmTestnet,
        supportedChains: [injectiveEvmTestnet],
      }}
    >
      <ToastProvider>
        <App />
      </ToastProvider>
    </PrivyProvider>
  </React.StrictMode>,
);
