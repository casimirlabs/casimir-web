import { createPublicClient, getContract, http, Address, createWalletClient, custom, EIP1193Provider, zeroAddress } from "viem"
import { mainnet, holesky } from "viem/chains"
import { EthereumProvider } from "@walletconnect/ethereum-provider"
import mainnetConfig from "@casimirlabs/casimir-contracts/config/mainnet.json"
import holeskyConfig from "@casimirlabs/casimir-contracts/config/holesky.json"
import { ICasimirFactoryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactoryAbi"
import { ICasimirManagerAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirManagerAbi"
import { ICasimirRegistryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirRegistryAbi"
import { onMounted, reactive, ref } from "vue"

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

let initialized =false

type StrategyStats = {
    totalStake: bigint
    userStake: bigint
}
type Strategy = Awaited<ReturnType<typeof factory.read.getStrategy>> & StrategyStats
type StrategyById = Record<number, Strategy>
const strategyById = reactive<StrategyById>({})
const userAddress = ref<Address>(zeroAddress)

export default function useEthereum() {
    onMounted(async () => {
        if (!initialized) {
            readClient.watchBlockNumber(
                { 
                    emitOnBegin: true, 
                    onBlockNumber: async () => await fetchData()
                }
            )
            initialized = true
        }
    })

    async function fetchData() {
        const strategyIds = await factory.read.getStrategyIds()
        const strategies = await Promise.all(strategyIds.map(async (id) => {
            const strategy = await factory.read.getStrategy([id])
            const manager = getManager(strategy.managerAddress)
            const [totalStake, userStake] = await Promise.all([
                await manager.read.getTotalStake(),
                await manager.read.getUserStake([userAddress.value])
            ])
            return {
                id,
                ...strategy,
                totalStake,
                userStake
            }
        }))
        for (const strategy of strategies) {
            const { id, ...rest } = strategy
            strategyById[id] = rest
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
        network,
        readClient,
        strategyById,
        userAddress,
        fetchData,
        getWalletConnectProvider,
        getManager,
        getRegistry
    }
}