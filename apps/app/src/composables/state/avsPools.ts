import { AVS } from "@casimir/types"
import { 
    onMounted,
    onUnmounted,
    ref
} from "vue"
import useToasts from "@/composables/state/toasts"
import { useStorage } from "@vueuse/core"

const { addToast } = useToasts()

const initializeComposable = ref(false)

// TODO: create AVS pool type here
const avsPools = ref([] as {
    poolName: string, 
    avsPool: { avs: AVS, allocatedPercentage: number, updatedAt: Date }[] 
    }[]
) 

const userSavedPools = useStorage(
    "userSavedPools",
    avsPools
)
// Will include pool name (that the user creates), and addeed avs's and their allocatedpercentage
  
export default function useAvsPools() {

    // add an empty pool by name
    const addPool = (name: string) => {
        avsPools.value.push({
            poolName: name,
            avsPool: []
        })
    }

    // add pool with an avs selected at once
    const addPoolWithAVS = (name: string, avs: { avs: AVS, allocatedPercentage: number }) => {
        avsPools.value.push({
            poolName: name,
            avsPool: [
                {
                    avs: avs.avs,
                    allocatedPercentage: 100.00,
                    updatedAt: new Date()
                }
            ]
        })
    }

    // removed pool by index
    const removePool = (index: number) => {
        if (index >= 0 && index < avsPools.value.length) {
            avsPools.value.splice(index, 1)
        }
    }

    const distributeAllocationPercentages = (index: number) => {
        let evenlyDistributedPercentage = 100
        if (avsPools.value[index].avsPool.length >= 1) {
            const value = 100 / avsPools.value[index].avsPool.length
            evenlyDistributedPercentage = Math.floor(value * 100) / 100
        }
        if (avsPools.value[index].avsPool.length >= 1) {
            for (let i = 0; i < avsPools.value[index].avsPool.length; i++) {
                avsPools.value[index].avsPool[i].allocatedPercentage = evenlyDistributedPercentage
            }
        }
        const totalDistributedPercentage = avsPools.value[index].avsPool.reduce((acc, item) => acc + item.allocatedPercentage, 0)
        const remainder = 100 - totalDistributedPercentage
        const sum = remainder + avsPools.value[index].avsPool[0].allocatedPercentage
        avsPools.value[index].avsPool[0].allocatedPercentage = parseFloat(sum.toFixed(2))
    }

    const addAVSToPool = (index: number, avs: { avs: AVS, allocatedPercentage: number }) => {
        const avsExsits = avsPools.value[index].avsPool.findIndex(item =>  item.avs.address === avs.avs.address)

        
        if (avsExsits === -1) {
            if (index >= 0 && index < avsPools.value.length) {
                avsPools.value[index].avsPool.push(
                    {
                        avs: avs.avs,
                        allocatedPercentage: 0,
                        updatedAt: new Date()
                    }
                )

                distributeAllocationPercentages(index)
            }
        } else {
            addToast(
                {
                    id: `attempt_to_add_duplicate_avs_${avs.avs.address}`,
                    type: "failed",
                    iconUrl: "",
                    title: "Duplicate AVS",
                    subtitle: "The AVS selected already exist under this pool",
                    timed: true,
                    loading: false
                }
            )
        }
    }

    const removeAVSFromPool = (index: number, avs: { avs: AVS, allocatedPercentage: number }) => {
        if (index >= 0 && index < avsPools.value.length) {
            const pool = avsPools.value[index]
    
            // Find the index of the AVS to remove within the avsPool array
            const avsIndex = pool.avsPool.findIndex(item =>
                item.avs.address === avs.avs.address
            )
    
            
            if (avsIndex !== -1) {
                // Remove the AVS from avsPool array
                pool.avsPool.splice(avsIndex, 1)
            }
            distributeAllocationPercentages(index)
        }
    }
      
    onMounted(() => {
        if (!initializeComposable.value) {
            initializeComposable.value = true
            avsPools.value = userSavedPools.value
        }
    })
    
    onUnmounted(() =>{
        // 
    })

    return {
        avsPools: avsPools,
        addPool,
        addPoolWithAVS,
        removePool,
        addAVSToPool,
        removeAVSFromPool
    }
}