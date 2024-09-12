import { reactive, ref, watch } from "vue"
import { Address } from "viem"
import useEthereum from "@/composables/ethereum"

export type AVS = {
    metadataName: string,
    address: string,
    tvl: number,
    tvlBeaconChain: number,
    tvlRestaking: number,
    metadataLogo: string,
    metadataDescription: string,
    metadataWebsite: string,
    metadataX: string,
    totalOperators: number,
    totalStakers: number
}

const avsByAddress = reactive<Record<Address, AVS>>({})
const selectedAVS = ref<AVS>()

export default function useAVS() {
    const { network, strategyById } = useEthereum()

    watch(strategyById, async () => {
        const addresses = new Set(Object.values(strategyById).map(strategy => strategy.strategyConfig.serviceAddress))
        await Promise.all(Array.from(addresses).map(async (address) => {
            avsByAddress[address] = await fetchAVS(address)
        }))
    })
    
    async function fetchAVS(address: Address): Promise<AVS> {
        const baseUrl = network === "mainnet" ? "https://api.eigenexplorer.com/" : "https://api-holesky.eigenexplorer.com/"
        const endpoint = "avs"
        const url = `${baseUrl}${endpoint}/${address}`
        const response = await fetch(url)
        return await response.json()
    }

    function selectAVS(avs: AVS) {
        selectedAVS.value = avs
    }

    return {
        avsByAddress,
        selectedAVS,
        selectAVS
    }
}