import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem"
import { mainnet, holesky } from "viem/chains"
import mainnetConfig from "@casimirlabs/casimir-contracts/config/mainnet.json"
import holeskyConfig from "@casimirlabs/casimir-contracts/config/holesky.json"
import { abi as ICasimirFactoryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactory.sol/ICasimirFactory.json"
import { abi as ICasimirManagerAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactory.sol/ICasimirFactory.json"
import { abi as ICasimirRegistryAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactory.sol/ICasimirFactory.json"
import { abi as ICasimirViewsAbi } from "@casimirlabs/casimir-contracts/abi/ICasimirFactory.sol/ICasimirFactory.json"
import useEnvironment from "@/composables/services/environment"
import { onMounted } from "vue"

let initialized = false
let provider: PublicClient
let wallet: WalletClient

export default function useContracts() {
    const { ethereumRpcUrl, network } = useEnvironment()

    onMounted(async () => {
        if (!initialized) {
            const config = {
                mainnet: mainnetConfig,
                holesky: holeskyConfig
            }[network]

            const chain = {
                mainnet: mainnet,
                holesky: holesky
            }[network]

            provider = createPublicClient({
                transport: http(ethereumRpcUrl),
                chain
            })

            initialized = true
        }
    })

    return {
        initialized
    }
}