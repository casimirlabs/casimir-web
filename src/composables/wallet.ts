import { reactive, readonly, ref } from "vue"
import { Address, createWalletClient, custom, EIP1193Provider } from "viem"
import { EthereumProvider } from "@walletconnect/ethereum-provider"
import useEthereum from "@/composables/ethereum"

interface BrowserProvider extends EIP1193Provider {
    isMetaMask?: boolean
    isCoinbaseWallet?: boolean
    providerMap?: Map<string, EIP1193Provider>
}

type ProviderString = "MetaMask" | "CoinbaseWallet" | "Ledger" | "Trezor" | "TrustWallet" | "WalletConnect"

interface Wallet {
    client: ReturnType<typeof createWalletClient> | null;
    provider: string | null;
    address: Address | null;
    balance: bigint | null;
    loading: boolean;
}
const walletConnectProjectId = import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

const showConnectWalletModal = ref(false)

const wallet = reactive<Wallet>({
    client: null,
    provider: null,
    address: null,
    balance: null,
    loading: false,
})

export default function useWallet() {
    const { chain, readClient } = useEthereum()

    async function connectWallet(providerString: ProviderString) {
        wallet.loading = true
        wallet.provider = providerString
        let provider: EIP1193Provider

        switch (providerString) {
        case "MetaMask":
            provider = getBrowserProvider("MetaMask") as EIP1193Provider
            break
            
        case "CoinbaseWallet":
            provider = getBrowserProvider("CoinbaseWallet") as EIP1193Provider
            break

        case "Ledger":
            // Initialize Ledger provider (assuming Ledger library is available)
            provider = await setupLedgerProvider()
            break

        case "Trezor":
            // Initialize Trezor provider (assuming Trezor library is available)
            provider = await setupTrezorProvider()
            break

        default:
            throw new Error("Unsupported wallet provider")
        }

        wallet.client = createWalletClient({
            transport: custom(provider),
            chain
        })

        const accounts = await wallet.client.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
            wallet.address = accounts[0]
        }

        if (wallet.address) {
            const formattedAddress = wallet.address.startsWith("0x") ? wallet.address : `0x${wallet.address}`            
            wallet.balance = await readClient.getBalance({ address: formattedAddress as `0x${string}` })
        }
        
        wallet.loading = false
    }

    async function disconnectWallet() {
        wallet.provider = null
        wallet.address = null
        wallet.balance = null
        wallet.client = null
        wallet.loading = false
    }

    async function getWalletConnectProvider() {
        return await EthereumProvider.init({
            projectId: walletConnectProjectId,
            showQrModal: true,
            chains: [chain.id]
        })
    }

    async function setupLedgerProvider(): Promise<EIP1193Provider> {
        // Implement Ledger provider setup logic here
        // This might involve integrating Ledger's specific wallet libraries (e.g., @ledgerhq/hw-app-eth)
        throw new Error("Ledger provider setup not implemented")
    }

    async function setupTrezorProvider(): Promise<EIP1193Provider> {
        // Implement Trezor provider setup logic here
        // This might involve integrating Trezor's specific wallet libraries (e.g., trezor-connect)
        throw new Error("Trezor provider setup not implemented")
    }

    function toggleWalletModal() {
        showConnectWalletModal.value = !showConnectWalletModal.value
    }

    return {
        wallet: readonly(wallet),
        showConnectWalletModal: readonly(showConnectWalletModal),
        connectWallet,
        disconnectWallet,
        getWalletConnectProvider,
        toggleWalletModal
    }
}

function getBrowserProvider(provider: "MetaMask" | "CoinbaseWallet"): EIP1193Provider | undefined {
    const ethereum = window.ethereum as BrowserProvider
    if (ethereum.providerMap) {
        for (const [key, value] of ethereum.providerMap) {
            if (key === provider) return value
        }
    } else if (provider === "MetaMask" && ethereum.isMetaMask) {
        return ethereum
    } else if (provider === "CoinbaseWallet" && ethereum.isCoinbaseWallet) {
        return ethereum
    } else {
        throw new Error("Unsupported browser provider")
    }
}