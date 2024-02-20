import { onMounted, readonly, ref, watch } from "vue"
import { Operator, Scanner } from "@casimir/ssv"
import { Account, PoolConfig, RegisteredOperator, RegisterOperatorWithCasimirParams } from "@casimir/types"
import { ethers } from "ethers"
import useContracts from "@/composables/services/contracts"
import useEnvironment from "@/composables/services/environment"
import useEthers from "@/composables/services/ethers"
import useLedger from "@/composables/services/ledger"
import useTrezor from "@/composables/services/trezor"
import useUser from "@/composables/services/user"
import useWallets from "@/composables/services/wallets"
import useWalletConnectV2 from "@/composables/services/walletConnectV2"
import { CasimirManager, CasimirRegistry, CasimirViews } from "@casimir/ethereum/build/@types"

let baseManager: CasimirManager
let baseRegistry: CasimirRegistry
let baseViews: CasimirViews

let eigenManager: CasimirManager
let eigenRegistry: CasimirRegistry
let eigenViews: CasimirViews

const { 
    contractsAreInitialized,
    getBaseManager,
    getBaseRegistry,
    getBaseViews,
    getEigenManager,
    getEigenRegistry,
    getEigenViews
} = useContracts()
const { ethereumUrl, ssvNetworkAddress, ssvViewsAddress, usersUrl, batchProvider, provider, wsProvider } = useEnvironment()
const { browserProvidersList, getEthersBrowserSigner } = useEthers()
const { getEthersLedgerSigner } = useLedger()
const { getEthersTrezorSigner } = useTrezor()
const { user } = useUser()
const { detectActiveNetwork, switchEthersNetwork } = useWallets()
const { getWalletConnectSignerV2 } = useWalletConnectV2()

const loadingRegisteredOperators = ref(false)
const loadingRegisteredOperatorsError = ref(false)

const nonregisteredBaseOperators = ref<Operator[]>([])
const nonregisteredEigenOperators = ref<Operator[]>([])
const registeredBaseOperators = ref<Operator[]>([])
const registeredEigenOperators = ref<Operator[]>([])

const initializeComposable = ref(false)

export default function useOperator() {
    async function addOperator({ address, nodeUrl }: { address: string, nodeUrl: string }) {
        try {
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ address, nodeUrl })
            }
            const response = await fetch(`${usersUrl}/user/add-operator`, requestOptions)
            const { error, message } = await response.json()
            return { error, message }
        } catch (error: any) {
            throw new Error(error.message || "Error adding operator")
        }
    }

    async function getUserOperators(): Promise<void> {
        const userAddresses = user.value?.accounts.map((account: Account) => account.address) as string[]

        const availableProvider = wsProvider || batchProvider || provider 
        const scanner = new Scanner({ 
            ethereumUrl,
            ssvNetworkAddress,
            ssvViewsAddress,
            provider: availableProvider
        })

        const ssvOperators: Operator[] = []
        for (const address of userAddresses) {
            const userOperators = await scanner.getOperators(address)
            ssvOperators.push(...userOperators)
        }

        registeredBaseOperators.value = await _getRegisteredOperators(ssvOperators, "base") as Array<RegisteredOperator>
        // registeredEigenOperators.value = await _getRegisteredOperators(ssvOperators, "eigen") as Array<RegisteredOperator>
        
        nonregisteredBaseOperators.value = ssvOperators.filter((operator: any) => {
            const idRegistered = registeredBaseOperators.value.find((registeredOperator: any) => registeredOperator.id === operator.id)
            return !idRegistered
        }) as Array<Operator>
        // nonregisteredEigenOperators.value = ssvOperators.filter((operator: any) => {
        //     const idRegistered = registeredEigenOperators.value.find((registeredOperator: any) => registeredOperator.id === operator.id)
        //     return !idRegistered
        // }) as Array<Operator>
    }

    async function _getRegisteredOperators(ssvOperators: Operator[], type: "base" | "eigen"): Promise<RegisteredOperator[]> {
        const casimirOperators: RegisteredOperator[] = []
        const registry = type === "base" ? baseRegistry : eigenRegistry
        if (registry.address === ethers.constants.AddressZero) return casimirOperators
        for (const operator of ssvOperators) {
            const { active, collateral, poolCount, resharing } = await (registry as CasimirRegistry).getOperator(operator.id)
            const registered = active || collateral.gt(0) || poolCount.gt(0) || resharing
            if (registered) {
                const pools = await _getPools(operator.id, type)
                // TODO: Replace these Public Nodes URLs once we have this working again
                const operatorStore = {
                    "208": "http://nodes.casimir.co:4031",
                    "209": "http://nodes.casimir.co:4032",
                    "210": "http://nodes.casimir.co:4033",
                    "211": "http://nodes.casimir.co:4034",
                    "212": "http://nodes.casimir.co:4035",
                    "213": "http://nodes.casimir.co:4036",
                    "214": "http://nodes.casimir.co:4037",
                    "215": "http://nodes.casimir.co:4038"
                }
                const url = operatorStore[operator.id.toString() as keyof typeof operatorStore]
                casimirOperators.push({
                    ...operator,
                    active,
                    collateral: ethers.utils.formatEther(collateral),
                    poolCount: poolCount.toNumber(),
                    url,
                    resharing,
                    pools
                })
            }
        }
        return casimirOperators
    }

    async function _getPools(operatorId: number, type: "base" | "eigen"): Promise<PoolConfig[]> {
        const pools: PoolConfig[] = []
        const manager = type === "base" ? baseManager : eigenManager
        const poolIds = [
            ...await (manager as CasimirManager).getPendingPoolIds(), ...await (manager as CasimirManager).getStakedPoolIds()
        ]
        const views = type === "base" ? baseViews : eigenViews
    
        for (const poolId of poolIds) {
            const poolConfig = await (views as CasimirViews).getPoolConfig(poolId)
            const pool = {
                ...poolConfig,
                operatorIds: poolConfig.operatorIds.map(id => id.toNumber()),
                reshares: poolConfig.reshares.toNumber()
            }
            if (pool.operatorIds.includes(operatorId)) {
                pools.push(pool)
            }
        }
        return pools
    }

    watch(contractsAreInitialized, async () => {
        if (contractsAreInitialized.value) {
            baseManager = getBaseManager()
            baseViews = getBaseViews()
            baseRegistry = getBaseRegistry()
            // eigenManager = getEigenManager()
            // eigenRegistry = getEigenRegistry()
            // eigenViews = getEigenViews()
            listenForContractEvents()
            await getUserOperators()
        }
    })
      
    onMounted(async () => {
        if (!initializeComposable.value) {
            initializeComposable.value = true
            if (!contractsAreInitialized.value) return
            baseManager = getBaseManager()
            baseViews = getBaseViews()
            baseRegistry = getBaseRegistry()
            // eigenManager = getEigenManager()
            // eigenRegistry = getEigenRegistry()
            // eigenViews = getEigenViews()
            listenForContractEvents()
            await getUserOperators()
        }
    })

    function listenForContractEvents() {
        try {
            (baseRegistry as CasimirRegistry).on("OperatorRegistered", () => getUserOperators())
            // (eigenRegistry as CasimirRegistry).on("OperatorRegistered", () => getUserOperators())

            // (registry as CasimirRegistry).on('OperatorDeregistered', getUserOperators)
            // (registry as CasimirRegistry).on('DeregistrationRequested', getUserOperators)
        } catch (err) {
            console.log(`There was an error in listenForContractEvents: ${err}`)
        }
    }

    async function registerOperatorWithCasimir({ walletProvider, address, operatorId, collateral, nodeUrl }: RegisterOperatorWithCasimirParams) {
        const activeNetwork = await detectActiveNetwork(walletProvider)
        if (activeNetwork !== 5) {
            await switchEthersNetwork(walletProvider, "0x5")
            return window.location.reload()
        }
        loadingRegisteredOperators.value = true
        try {
            let signer
            if (browserProvidersList.includes(walletProvider)) {
                signer = getEthersBrowserSigner(walletProvider)
            } else if (walletProvider === "WalletConnect") {
                await getWalletConnectSignerV2()
            } else if (walletProvider === "Ledger") {
                getEthersLedgerSigner()
            } else if (walletProvider === "Trezor") {
                getEthersTrezorSigner()
            } else {
                throw new Error(`Invalid wallet provider: ${walletProvider}`)
            }
            const value = ethers.utils.parseEther(collateral)
            const result = await (baseRegistry as CasimirRegistry)
                .connect(signer as ethers.Signer)
                .registerOperator(operatorId, { from: address, value })
            // TODO: @shanejearley - How many confirmations do we want to wait?
            await result?.wait(1)
            await addOperator({ address, nodeUrl })
            loadingRegisteredOperators.value = false
        } catch (err) {
            loadingRegisteredOperatorsError.value = true
            console.error(`There was an error in registerOperatorWithCasimir function: ${JSON.stringify(err)}`)
            loadingRegisteredOperators.value = false
        }
    }

    return { 
        nonregisteredBaseOperators: readonly(nonregisteredBaseOperators),
        nonregisteredEigenOperators: readonly(nonregisteredEigenOperators),
        registeredBaseOperators: readonly(registeredBaseOperators),
        registeredEigenOperators: readonly(registeredEigenOperators),
        registerOperatorWithCasimir
    }
}