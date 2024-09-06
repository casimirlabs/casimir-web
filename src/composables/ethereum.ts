import { createPublicClient, getContract, http, Address, createWalletClient, custom, EIP1193Provider } from "viem"
import { mainnet, holesky } from "viem/chains"
import { EthereumProvider } from "@walletconnect/ethereum-provider"
import mainnetConfig from "@casimirlabs/casimir-contracts/config/mainnet.json"
import holeskyConfig from "@casimirlabs/casimir-contracts/config/holesky.json"
import { ICasimirFactoryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactoryAbi"
import { ICasimirManagerAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirManagerAbi"
import { ICasimirRegistryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirRegistryAbi"
import { reactive, ref } from "vue"

const network: "mainnet" | "holesky" = import.meta.env.PUBIC_NETWORK || "holesky"
const ethereumRpcUrl = import.meta.env.PUBLIC_ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
const walletConnectProjectId = import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

const config = { mainnet: mainnetConfig, holesky: holeskyConfig }[network]
const chain = { mainnet: mainnet, holesky: holesky }[network]

const readClient = createPublicClient({
    transport: http(ethereumRpcUrl),
    chain
})

const factory = getContract({ 
    abi: ICasimirFactoryAbi,
    address: config.factoryAddress as Address,
    client: readClient
})

const initialized = ref(false)

type StrategyStats = {
    totalStake: bigint
}
type Strategy = Awaited<ReturnType<typeof factory.read.getStrategy>> & StrategyStats
type StrategyById = Record<number, Strategy>
let strategyById = reactive<StrategyById>({})

export default function useEthereum() {
    async function initialize() {
        if (!initialized.value) {
            const strategyIds = await factory.read.getStrategyIds()
            const strategies = await Promise.all(strategyIds.map(async (id) => {
                const strategy = await factory.read.getStrategy([id])
                const manager = getManager(strategy.managerAddress)
                const totalStake = await manager.read.getTotalStake()
                return {
                    id,
                    ...strategy,
                    totalStake
                }
            }))
            strategyById = strategies.reduce((acc, strategy) => {
                const { id, ...rest } = strategy
                acc[id] = rest
                return acc
            }, {} as StrategyById)

            initialized.value = true
        }
    }

    async function getWalletConnectProvider() {
        return await EthereumProvider.init({
            projectId: walletConnectProjectId,
            showQrModal: true,
            chains: [chain.id]
        })
    }

    function getManager(address: Address, provider?: EIP1193Provider) {
        let writeClient: ReturnType<typeof createWalletClient> | undefined
        if (provider) {
            writeClient = createWalletClient({
                transport: custom(provider),
                chain
            })
        }
        return getContract({
            abi: ICasimirManagerAbi,
            address,
            client: {
                public: readClient,
                wallet: writeClient
            }
        })
    }

    function getRegistry(address: Address, provider?: EIP1193Provider) {
        let writeClient: ReturnType<typeof createWalletClient> | undefined
        if (provider) {
            writeClient = createWalletClient({
                transport: custom(provider),
                chain
            })
        }
        return getContract({
            abi: ICasimirRegistryAbi,
            address,
            client: {
                public: readClient,
                wallet: writeClient
            }
        })
    }

    return {
        initialized,
        readClient,
        strategyById,
        initialize,
        getWalletConnectProvider,
        getManager,
        getRegistry
    }
}