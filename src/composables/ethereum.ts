import { createPublicClient, getContract, http, Address, zeroAddress } from "viem"
import { mainnet, holesky } from "viem/chains"
import mainnetConfig from "@casimirlabs/casimir-contracts/config/mainnet.json"
import holeskyConfig from "@casimirlabs/casimir-contracts/config/holesky.json"
import { ICasimirFactoryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactoryAbi"
import { ICasimirManagerAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirManagerAbi"
import { ICasimirRegistryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirRegistryAbi"
import { onMounted, reactive, ref } from "vue"

export type Strategy = Awaited<ReturnType<typeof factory.read.getStrategy>> & StrategyStats
type StrategyById = Record<number, Strategy>
type StrategyStats = {
    totalStake: bigint
    userStake: bigint
}

const abi = {
    factory: ICasimirFactoryAbi,
    manager: ICasimirManagerAbi,
    registry: ICasimirRegistryAbi
}

const network: "mainnet" | "holesky" = import.meta.env.PUBIC_NETWORK || "holesky"
const ethereumRpcUrl = import.meta.env.PUBLIC_ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
const config = { mainnet: mainnetConfig, holesky: holeskyConfig }[network]
const chain = { mainnet: mainnet, holesky: holesky }[network]

if (import.meta.env.DEV) {
    // @ts-ignore
    chain.id = 31337
}

const readClient = createPublicClient({
    transport: http(ethereumRpcUrl),
    chain
})

const factory = getContract({ 
    abi: abi.factory,
    address: config.factoryAddress as Address,
    client: readClient
})

let initialized =false
const strategyById = reactive<StrategyById>({})
const userAddress = ref<Address>(zeroAddress)

export default function useEthereum() {
    let onBalanceUpdate: (() => void) | null = null

    // Allow wallet composable to pass an update handler
    function setOnBalanceUpdate(callback: () => void) {
        onBalanceUpdate = callback
    }
    
    onMounted(async () => {
        if (!initialized) {
            readClient.watchBlockNumber(
                { 
                    emitOnBegin: true, 
                    onBlockNumber: async () => {
                        await fetchData()
                    }
                }
            )
            initialized = true
        }
    })

    async function fetchData() {
        const strategyIds = await factory.read.getStrategyIds()
        const strategies = await Promise.all(strategyIds.map(async (id) => {
            const strategy = await factory.read.getStrategy([id])
            const manager = getContract({
                abi: abi.manager,
                address: strategy.managerAddress,
                client: {
                    public: readClient
                }
            })
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

        // Fetch and update balance if the callback exists
        if (onBalanceUpdate) {
            onBalanceUpdate()
        }
    }

    return {
        abi,
        chain,
        config,
        network,
        readClient,
        strategyById,
        userAddress,
        fetchData,
        setOnBalanceUpdate
    }
}