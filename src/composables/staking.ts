import { computed, readonly, ref } from "vue"
import { getContract, Address, parseUnits } from "viem"
import useAVS, { AVS } from "@/composables/avs"
import useEthereum, { Strategy } from "@/composables/ethereum"
import useToasts from "@/composables/toasts"
import useWallet from "@/composables/wallet"

type StakeOption = {
    id: number,
    avs: AVS,
    strategy: Strategy
}

interface StakeOptionWithAllocation extends StakeOption {
    allocatedPercentage: number;
    isLocked: boolean;
}

const stage = ref([] as StakeOptionWithAllocation[])
const amountToStake = ref(5)
const acceptedTerms = ref(false)
const selectedStakeOption = ref<StakeOption>()

export default function useStaking() {
    const { abi, readClient, strategyById } = useEthereum()
    const { avsByAddress } = useAVS()
    const { addToast, generateRandomToastId } = useToasts()
    const { wallet } = useWallet()
    const stakeOptions = computed(() => {
        return Object.entries(strategyById).map(([id, strategy]) => {
            const avs = avsByAddress[strategy.strategyConfig.serviceAddress]
            return {
                id: Number(id),
                avs,
                strategy
            }
        })
    })

    function addStakeOptionToStage(stakeOption: StakeOptionWithAllocation) {
        const optionExists = stage.value.findIndex(item => item?.avs.address === stakeOption.avs.address)
        if (optionExists === -1) {
            stage.value.push(stakeOption)
            distributeAllocationPercentages()
        } else {
            addToast({
                id: `attempt_to_add_duplicate_avs_${stakeOption.avs.address}`,
                type: "failed",
                iconUrl: "",
                title: "Duplicate Stake Option",
                subtitle: "The selected stake option already exists in the stage",
                timed: true,
                loading: false,
            })
        }
    }
    
    function removeStakeOptionFromStage(stakeOption: StakeOptionWithAllocation) {
        const optionIndex = stage.value.findIndex(item => item?.avs.address === stakeOption.avs.address)
        if (optionIndex !== -1) {
            stage.value.splice(optionIndex, 1)
            distributeAllocationPercentages()
        }
    }

    function onAllocationChange(index: number, newPercentage: string) {
        const parsedPercentage = parseFloat(newPercentage)
        if (isNaN(parsedPercentage)) {
            stage.value[index].allocatedPercentage = 0
            return
        }

        const currentOption = stage.value[index]
        if (currentOption.isLocked) return

        const lockedPercentage = stage.value.reduce((acc, option) => acc + (option.isLocked ? option.allocatedPercentage : 0), 0)
        const maxPercentage = 100 - lockedPercentage

        currentOption.allocatedPercentage = Math.min(parsedPercentage, maxPercentage)

        const totalUnlockedPercentage = stage.value.reduce((acc, option) => acc + (option.isLocked ? 0 : option.allocatedPercentage), 0)
        const difference = maxPercentage - totalUnlockedPercentage

        if (difference !== 0) {
            const remainingOptions = stage.value.filter(option => !option.isLocked && option !== currentOption)

            if (remainingOptions.length > 0) {
                const totalRemaining = remainingOptions.reduce((acc, option) => acc + option.allocatedPercentage, 0)

                if (totalRemaining > 0) {
                    remainingOptions.forEach(option => {
                        option.allocatedPercentage = Math.max(0, option.allocatedPercentage + (option.allocatedPercentage / totalRemaining) * difference)
                    })
                } else {
                    const equalDistribution = difference / remainingOptions.length
                    remainingOptions.forEach(option => {
                        option.allocatedPercentage = Math.max(0, option.allocatedPercentage + equalDistribution)
                    })
                }
            } else {
                currentOption.allocatedPercentage = Math.max(0, currentOption.allocatedPercentage + difference)
            }
        }

        const finalTotalPercentage = stage.value.reduce((acc, option) => acc + (option.isLocked ? 0 : option.allocatedPercentage), 0)
        if (finalTotalPercentage !== maxPercentage) {
            const finalAdjustment = maxPercentage - finalTotalPercentage

            const firstUnlockedOption = stage.value.find(option => !option.isLocked)
            if (firstUnlockedOption) {
                firstUnlockedOption.allocatedPercentage = Math.max(0, firstUnlockedOption.allocatedPercentage + finalAdjustment)
            }
        }
    }
    
    function lockStakeOptionAllocation(stakeOption: StakeOptionWithAllocation) {
        const option = stage.value.find(item => item.avs.address === stakeOption.avs.address)
        if (option) {
            option.isLocked = true
        }
    }

    function unlockStakeOptionAllocation(stakeOption: StakeOptionWithAllocation) {
        const option = stage.value.find(item => item.avs.address === stakeOption.avs.address)
        if (option) {
            option.isLocked = false
        }
    }

    async function stake() {
        if (!wallet.client) throw new Error("Wallet not connected")
        if (stage.value.length === 0) {
            addToast({
                id: generateRandomToastId(),
                type: "failed",
                iconUrl: "",
                title: "No Stake Options",
                subtitle: "Please add at least one stake option to the stage before submitting",
                timed: true,
                loading: false,
            })
            return
        }

        const toastContent = {
            id: generateRandomToastId(),
            type: "loading",
            iconUrl: "",
            title: "Submitting Stake",
            subtitle: "Processing stake request",
            timed: false,
            loading: true
        }
        addToast(toastContent)

        try {
            const manager = getContract({
                abi: abi.manager,
                address: selectedStakeOption.value?.strategy.managerAddress as Address,
                client: {
                    account: wallet.address,
                    public: readClient,
                    wallet: wallet.client
                }
            })

            const amountToStakeInWei = parseUnits(amountToStake.value.toString(), 18)
            const txHash = await manager.write.depositStake({ value: amountToStakeInWei, account: wallet.address })
            toastContent.loading = false
            toastContent.title = "Stake Successful"
            toastContent.subtitle = `Transaction hash: ${txHash}`
            stage.value = []
            addToast(toastContent)
        } catch (error) {
            console.error("Staking error:", error)
            toastContent.loading = false
            toastContent.type = "error"
            toastContent.title = "Stake Failed"
            toastContent.subtitle = (error as Error).message || "Unknown error occurred"
            addToast(toastContent)
        }
    }

    function selectStakeOption(id: number) {
        selectedStakeOption.value = stakeOptions.value.find(option => option.id === id)
        if (!selectedStakeOption.value) throw new Error("Invalid stake option")
    }

    function setAmountToStake(amount: number) {
        amountToStake.value = amount
    }

    function toggleAcceptedTerms() {
        acceptedTerms.value = !acceptedTerms.value
    }

    return {
        acceptedTerms: readonly(acceptedTerms),
        amountToStake: readonly(amountToStake),
        stakeOptions: readonly(stakeOptions),
        selectedStakeOption,
        stage,
        addStakeOptionToStage,
        removeStakeOptionFromStage,
        onAllocationChange,
        lockStakeOptionAllocation,
        unlockStakeOptionAllocation,
        setAmountToStake,
        selectStakeOption,
        stake,
        toggleAcceptedTerms,
    }
}

function distributeAllocationPercentages() {
    const totalItems = stage.value.length

    if (totalItems > 0) {
        const unlockedItems = stage.value.filter(item => !item.isLocked)
        const totalUnlockedItems = unlockedItems.length
        if (totalUnlockedItems > 0) {
            const evenPercentage = Math.floor((100 / totalUnlockedItems) * 100) / 100

            unlockedItems.forEach(item => {
                item.allocatedPercentage = evenPercentage
            })

            const totalDistributedPercentage = stage.value.reduce((acc, item) => acc + (item.isLocked ? 0 : item.allocatedPercentage), 0)
            const remainder = 100 - totalDistributedPercentage

            if (unlockedItems.length > 0 && remainder > 0) {
                unlockedItems[0].allocatedPercentage += remainder
            }
        }
    }
}