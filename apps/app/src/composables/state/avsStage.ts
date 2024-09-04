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
            stage.value.push(avs)
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
    }
    
    function removeAVSFromStage(avs: AVSWithAllocation) {
        const avsIndex = stage.value.findIndex(item => item.address === avs.address)
        if (avsIndex !== -1) {
            stage.value.splice(avsIndex, 1)
            distributeAllocationPercentages()
        }
    }

    function distributeAllocationPercentages() {
        const totalItems = stage.value.length
    
        if (totalItems > 0) {
            const lockedItems = stage.value.filter(item => item.isLocked)
            const unlockedItems = stage.value.filter(item => !item.isLocked)
    
            const totalUnlockedItems = unlockedItems.length
    
            if (totalUnlockedItems > 0) {
                const evenPercentage = Math.floor((100 / totalUnlockedItems) * 100) / 100
    
                unlockedItems.forEach(item => {
                    item.allocatedPercentage = evenPercentage
                })
    
                const totalDistributedPercentage = stage.value.reduce((acc, item) => acc + (item.isLocked ? 0 : item.allocatedPercentage), 0)
                const remainder = 100 - totalDistributedPercentage
    
                if (unlockedItems.length > 0) {
                    unlockedItems[0].allocatedPercentage += remainder
                }
            }
        }
    }

    function onAllocationChange(index: number, newPercentage: string) {
        const parsedPercentage = parseFloat(newPercentage)
        if (isNaN(parsedPercentage)) {
            stage.value[index].allocatedPercentage = 0
            return
        }
    
        const currentAVS = stage.value[index]
        if (currentAVS.isLocked) return
    
        const lockedPercentage = stage.value.reduce((acc, avs) => acc + (avs.isLocked ? avs.allocatedPercentage : 0), 0)
        const maxPercentage = 100 - lockedPercentage
    
        currentAVS.allocatedPercentage = Math.min(parsedPercentage, maxPercentage)
        
        const totalUnlockedPercentage = stage.value.reduce((acc, avs) => acc + (avs.isLocked ? 0 : avs.allocatedPercentage), 0)
        const difference = maxPercentage - totalUnlockedPercentage
    
        if (difference !== 0) {
            // Get remaining unlocked AVSs excluding the current one
            const remainingAVSs = stage.value.filter(avs => !avs.isLocked && avs !== currentAVS)
            
            if (remainingAVSs.length > 0) {
                // Calculate total allocated percentage for remaining AVSs
                const totalRemaining = remainingAVSs.reduce((acc, avs) => acc + avs.allocatedPercentage, 0)
    
                if (totalRemaining > 0) {
                    // Adjust remaining AVSs proportionally
                    remainingAVSs.forEach(avs => {
                        avs.allocatedPercentage = Math.max(0, avs.allocatedPercentage + (avs.allocatedPercentage / totalRemaining) * difference)
                    })
                } else {
                    // Distribute difference evenly if all remaining AVSs have 0 allocated percentage
                    const equalDistribution = difference / remainingAVSs.length
                    remainingAVSs.forEach(avs => {
                        avs.allocatedPercentage = Math.max(0, avs.allocatedPercentage + equalDistribution)
                    })
                }
            } else {
                // If no remaining AVSs, adjust the current AVS to fix the total
                currentAVS.allocatedPercentage = Math.max(0, currentAVS.allocatedPercentage + difference)
            }
        }
    
        // Ensure the total allocation sums to exactly maxPercentage
        const finalTotalPercentage = stage.value.reduce((acc, avs) => acc + (avs.isLocked ? 0 : avs.allocatedPercentage), 0)
        if (finalTotalPercentage !== maxPercentage) {
            const finalAdjustment = maxPercentage - finalTotalPercentage
    
            // Apply the final adjustment to the first unlocked AVS
            const firstUnlockedAVS = stage.value.find(avs => !avs.isLocked)
            if (firstUnlockedAVS) {
                firstUnlockedAVS.allocatedPercentage = Math.max(0, firstUnlockedAVS.allocatedPercentage + finalAdjustment)
            }
        }
    }
    

    function lockAVSAllocation(avs: AVSWithAllocation) {
        const avsItem = stage.value.find(item => item.address === avs.address)
        if (avsItem) {
            avsItem.isLocked = true
        }
    }

    function unlockAVSAllocation(avs: AVSWithAllocation) {
        const avsItem = stage.value.find(item => item.address === avs.address)
        if (avsItem) {
            avsItem.isLocked = false
        }
    }
    
    return {
        stage,
        addAVSToStage,
        removeAVSFromStage,
        onAllocationChange,
        lockAVSAllocation,
        unlockAVSAllocation,
    }
}
