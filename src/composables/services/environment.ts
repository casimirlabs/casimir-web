const domain = window.location.host
const network: "mainnet" | "holesky" = import.meta.env.PUBIC_NETWORK || "holesky"
const ethereumRpcUrl = import.meta.env.PUBLIC_ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
const docsUrl = import.meta.env.PUBLIC_DOCS_URL || "https://docs.dev.casimir.co"
const walletConnectProjectId = import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID
const cryptoCompareApiKey = import.meta.env.PUBLIC_CRYPTO_COMPARE_API_KEY || ""

export default function useEnvironment() {
    return {
        domain,
        cryptoCompareApiKey,
        ethereumRpcUrl,
        network,
        docsUrl,
        walletConnectProjectId
    }
}