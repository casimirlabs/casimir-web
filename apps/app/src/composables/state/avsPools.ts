import { AVS } from "@casimir/types"
import { 
    onMounted,
    onUnmounted,
    ref
} from "vue"


const initializeComposable = ref(false)

// TODO: create AVS pool type here
const avsPools = ref([] as {
    poolName: string, 
    avsPool: { avs: AVS, allocatedPercentage: number }[] 
    }[]
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
            avsPool: [avs]
        })
    }

    // removed pool by index
    const removePool = (index: number) => {
        if (index >= 0 && index < avsPools.value.length) {
            avsPools.value.splice(index, 1)
        }
    }

    const addAVSToPool = (index: number, avs: { avs: AVS, allocatedPercentage: number }) => {
        if (index >= 0 && index < avsPools.value.length) {
            avsPools.value[index].avsPool.push(avs)
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
        }
    }
      
    onMounted(() => {
        if (!initializeComposable.value) {
            initializeComposable.value = true
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