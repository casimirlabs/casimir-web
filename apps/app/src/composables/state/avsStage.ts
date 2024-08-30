import { onMounted, ref } from "vue"
import { AVSWithAllocation } from "@casimir/types"
import useToasts from "@/composables/state/toasts"
import { useStorage } from "@vueuse/core"

const { addToast } = useToasts()

const initializeComposable = ref(false)

const stage = ref([] as AVSWithAllocation[])
const userSavedStage = useStorage(
    "userSavedStage",
    stage
)

  
export default function useAvsStage() {
    onMounted(() => {
        if (!initializeComposable.value) {
            initializeComposable.value = true
            stage.value = userSavedStage.value
        }
    })

    function addAVSToStage(avs: AVSWithAllocation) {
        const avsExists = stage.value.findIndex(item => item.address === avs.address)
        if (avsExists === -1) {
            // Add the new AVS to the stage
            stage.value.push(avs)
            
            // Distribute allocation percentages evenly
            distributeAllocationPercentages()
        } else {
            addToast({
                id: `attempt_to_add_duplicate_avs_${avs.address}`,
                type: "failed",
                iconUrl: "",
                title: "Duplicate AVS",
                subtitle: "The AVS selected already exists in the stage",
                timed: true,
                loading: false,
            })
        }
        console.log("stage.value :>> ", stage.value)
    }
    
    function removeAVSFromStage(avs: AVSWithAllocation) {
        const avsIndex = stage.value.findIndex(item => item.address === avs.address)
        if (avsIndex !== -1) {
            // Remove the AVS from the stage
            stage.value.splice(avsIndex, 1)
            
            // Distribute allocation percentages evenly
            distributeAllocationPercentages()
        }
    }

    function adjustAllocation(index: number, newPercentage: string) {
        const avsCount = stage.value.length
        if (avsCount > 1) {
            const validNewPercentage = parseFloat(newPercentage)

            // Set the new percentage for the adjusted AVS
            stage.value[index].allocatedPercentage = validNewPercentage

            const totalRemainingPercentage = parseFloat((100 - validNewPercentage).toFixed(2))

            const remainingAVSs = stage.value.filter((_, i) => i !== index)

            if (remainingAVSs.length > 0) {
                const remainingAllocatedPercentage = remainingAVSs.reduce(
                    (acc, item) => acc + item.allocatedPercentage,
                    0
                )

                // Distribute the remaining percentage among the other AVSs
                remainingAVSs.forEach((avs) => {
                    const proportionalShare = (avs.allocatedPercentage / remainingAllocatedPercentage) * totalRemainingPercentage
                    avs.allocatedPercentage = parseFloat(proportionalShare.toFixed(2))
                })

                // Correct any rounding errors by adjusting the first AVS
                const totalDistributedPercentage = stage.value.reduce(
                    (acc, item) => acc + item.allocatedPercentage,
                    0
                )

                const remainder = parseFloat((100 - totalDistributedPercentage).toFixed(2))
                stage.value[0].allocatedPercentage += remainder
            }
        } else if (avsCount === 1) {
            stage.value[0].allocatedPercentage = 100
        }
    }
    
    function distributeAllocationPercentages() {
        const totalItems = stage.value.length
    
        if (totalItems > 0) {
            // Calculate the evenly distributed percentage
            const evenPercentage = Math.floor((100 / totalItems) * 100) / 100
            
            // Assign the even percentage to each item
            stage.value.forEach(item => {
                item.allocatedPercentage = evenPercentage
            })
    
            // Adjust the first item's allocation to handle any rounding discrepancies
            const totalDistributedPercentage = stage.value.reduce((acc, item) => acc + item.allocatedPercentage, 0)
            const remainder = 100 - totalDistributedPercentage
            stage.value[0].allocatedPercentage += remainder
        }
    }
    
    return {
        stage,
        addAVSToStage,
        removeAVSFromStage,
        adjustAllocation,
    }
}


// const distributeAllocationPercentages = (index: number) => {
//     let evenlyDistributedPercentage = 100
//     if (avsPools.value[index].avsPool.length >= 1) {
//         const value = 100 / avsPools.value[index].avsPool.length
//         evenlyDistributedPercentage = Math.floor(value * 100) / 100
//     }
//     if (avsPools.value[index].avsPool.length >= 1) {
//         for (let i = 0; i < avsPools.value[index].avsPool.length; i++) {
//             avsPools.value[index].avsPool[i].allocatedPercentage = evenlyDistributedPercentage
//         }
//     }
//     const totalDistributedPercentage = avsPools.value[index].avsPool.reduce((acc, item) => acc + item.allocatedPercentage, 0)
//     const remainder = 100 - totalDistributedPercentage
//     const sum = remainder + avsPools.value[index].avsPool[0].allocatedPercentage
//     avsPools.value[index].avsPool[0].allocatedPercentage = parseFloat(sum.toFixed(2))
// }