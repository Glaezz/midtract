import 'dotenv/config';
function required(key) {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing required env var: ${key}`);
    return value;
}
export const env = {
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: required('DATABASE_URL'),
    chain: {
        rpcUrl: required('INJECTIVE_TESTNET_RPC'),
        chainId: Number(process.env.CHAIN_ID ?? 1439),
    },
    contracts: {
        escrowAddress: required('ESCROW_CONTRACT_ADDRESS'),
        stablecoinAddress: required('STABLECOIN_ADDRESS'),
        poolWalletAddress: required('POOL_WALLET_ADDRESS'),
    },
    relayerPrivateKey: required('RELAYER_PRIVATE_KEY'),
    poolWalletPrivateKey: required('POOL_WALLET_PRIVATE_KEY'),
    midtrans: {
        serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
        clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    },
    okeconnect: {
        apiKey: process.env.OKECONNECT_API_KEY ?? '',
        baseUrl: process.env.OKECONNECT_BASE_URL ?? '',
    },
    privy: {
        appId: required('PRIVY_APP_ID'), // wajib -- dipakai middleware verifikasi token di HAMPIR SEMUA endpoint
        appSecret: required('PRIVY_APP_SECRET'),
    },
};
