<script setup>
import { ref } from "vue"
import { CheckIcon, XMarkIcon, DocumentDuplicateIcon, LockOpenIcon, LockClosedIcon } from "@heroicons/vue/24/outline"
import useFormat from "@/composables/format"
import useStaking from "@/composables/staking"
import useToasts from "@/composables/toasts"
import useWallet from "@/composables/wallet"
import { formatEther } from "viem"

const { copyTextToClipboard, formatAddress, handleImageError } = useFormat()
const {
    acceptedTerms,
    amountToStake,
    stage,
    lockStakeOptionAllocation, 
    onAllocationChange,
    removeStakeOptionFromStage,
    setAmountToStake,
    stake,
    toggleAcceptedTerms,
    unlockStakeOptionAllocation 
} = useStaking()
const { addToast, generateRandomToastId } = useToasts()
const { wallet } = useWallet()

async function handleStake() {
    if (!stage.value.length) {
        addToast({
            id: generateRandomToastId(),
            type: "failed",
            iconUrl: "", // You can use an appropriate icon for your toast
            title: "No AVS Selected",
            subtitle: "Please select at least one AVS before staking.",
            timed: true,
            loading: false,
        })
    } else {
        await stake()
    }
}
function onAmountChange(event) {
    const value = parseFloat(event.target.value)
    // Ensure the value is a valid number and less than or equal to wallet balance
    if (!isNaN(value) && value <= parseFloat(formatEther(wallet.balance))) {
        setAmountToStake(value)
    } else {
        // If invalid, default to max balance (convert from wei to eth)
        setAmountToStake(parseFloat(formatEther(wallet.balance)))
    }
}
</script>

<template>
    <div
        class="card w-full shadow p-[24px]"
        style="transition: all ease 0.3s; overflow: visible"
    >
        <!-- Header, Title/Subtitle, Stake Button -->
        <div class="flex items-start justify-between gap-[12px]">
            <div class="text-left pb-[24px]">
                <h1 class="card_title">
                    Stage
                </h1>
                <p class="card_subtitle">
                    Add one or more AVSs to the stage and allocate a staking percentage to each
                </p>
            </div>

            <div class="flex items-center gap-[12px]">
                <button
                    class="primary_btn"
                    :class="{ 'disabled-btn': !stage.length }"
                    @click="handleStake"
                >
                    <small>Stake</small>
                </button>
            </div>
        </div>

        <!-- The Stage -->
        <div
            v-if="stage.length"
            class="w-full flex flex-wrap items-center gap-[24px]"
        >
            <!-- Amount to stake input -->
            <div class="p-[12px] min-h-[260px] min-w-[300px] bg-gray_4 dark:bg-gray_6 rounded-[6px] shadow-lg">
                <div class="mb-6">
                    <label
                        class="block text-white text-sm font-medium mb-3"
                        for="stake-amount"
                    >
                        Amount to Stake
                    </label>
                    <div class="relative">
                        <input
                            id="stake-amount"
                            v-model="amountToStake"
                            type="number"
                            class="input_container"
                            :max="wallet?.balance"
                            min="0"
                            placeholder="0"
                            @input="onAmountChange"
                        >
                        <button
                            class="secondary_btn absolute inset-y-0 right-0 flex items-center px-4 text-sm rounded-r-l"
                            @click="setAmountToStake(parseFloat(formatEther(wallet?.balance)))"
                        >
                            Max
                        </button>
                    </div>
                    <p class="text-gray-400 text-sm mt-2">
                        Available Balance: <span class="font-semibold">{{ wallet.provider ? formatEther(wallet?.balance) : '' }} ETH</span>
                    </p>
                </div>
            </div>

            <!-- AVS Stage Card -->
            <div
                v-for="(option, index) in stage"
                :key="index"
                class="p-[12px] bg-gray_4 dark:bg-gray_6 rounded-[6px] w-full min-w-[300px] max-w-[350px]"
            >
                <div class="text-left pb-[24px] flex items-start justify-between">
                    <div class="flex items-start gap-[12px]">
                        <div class="w-[32px] h-[32px] bg-gray_5 rounded-[999px] overflow-hidden">
                            <img
                                :src="option.avs.metadataLogo"
                                alt=""
                                class="w-full h-full mx-auto my-auto"
                                @error="handleImageError"
                            >
                        </div>
                        <div>
                            <h1 class="card_title">
                                {{ option.avs.metadataName }}
                            </h1>
                            <div
                                class="tooltip_container flex items-center gap-[6px]"
                                @click="copyTextToClipboard(option.avs.address)"
                            >
                                <p class="card_subtitle">
                                    {{ formatAddress(option.avs.address) }}
                                </p>
                                <div>
                                    <DocumentDuplicateIcon class="w-[12px] h-[12px]" />
                                </div>
                                <div class="tooltip w-[151px]">
                                    Service Manager Address
                                </div>
                            </div>
                        </div>
                    </div>
                    <button @click="removeStakeOptionFromStage(option)">
                        <XMarkIcon class="w-[16px] h-[16px]" />
                    </button>
                </div>
                <div class="text-[12px] tracking-normal mb-[12px] truncate">
                    {{ option.avs.metadataDescription }}
                </div>

                <div class="w-full">
                    <div class="flex items-center w-full justify-between">
                        <small class="font-[500]">Total Operators</small>
                        <small class="font-[500] opacity-50">{{ option.avs.totalOperators }}</small>
                    </div>
                    <div class="flex items-center w-full justify-between mt-[12px]">
                        <small class="font-[500]">Total Stakers</small>
                        <small class="font-[500] opacity-50">{{ option.avs.totalStakers }}</small>
                    </div>
                    <div class="flex items-center w-full justify-between mt-[12px]">
                        <small class="font-[500]">Total ETH Staked</small>
                        <small class="font-[500] opacity-50">{{ option.avs.tvl }} ETH</small>
                    </div>
                </div>

                <div class="mt-[24px] mb-[6px]">
                    <small>Allocated Percentage</small>
                </div>
                <div class="mb-[12px] flex items-center gap-[12px] w-full">
                    <div class="flex items-center gap-[3px]">
                        <input
                            v-model="option.allocatedPercentage"
                            type="text"
                            :placeholder="option.allocatedPercentage"
                            class="w-[50px] text-left outline-none bg-transparent"
                            :disabled="option.isLocked"
                            @input="onAllocationChange(index, $event.target.value)"
                        >
                        <span class="text-[10.22px]">%</span>
                    </div>
                    <div class="w-full">
                        <input
                            id="myRange"
                            v-model="option.allocatedPercentage"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            class="slider"
                            :disabled="option.isLocked"
                            @input="onAllocationChange(index, option.allocatedPercentage)"
                        >
                    </div>
                    <!-- Lock/Unlock -->
                    <div class="flex items-center justify-between">
                        <button
                            v-if="!option.isLocked"
                            class="flex items-center gap-[6px]"
                            @click="lockStakeOptionAllocation(option)"
                        >
                            <LockOpenIcon class="w-[16px] h-[16px]" />
                        </button>
                        <button
                            v-else
                            class="flex items-center gap-[6px]"
                            @click="unlockStakeOptionAllocation(option)"
                        >
                            <LockClosedIcon class="w-[16px] h-[16px]" />
                        </button>
                    </div>
                    <!-- Calculated value of how much ETH -->
                    <small class="flex justify-end font-[500] min-w-[80px]">
                        {{ amountToStake * option.allocatedPercentage ? amountToStake * option.allocatedPercentage / 100 : '0.00' }} ETH
                    </small>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-[12px] mt-6">
            <button
                class="checkbox_button bg-transparent h-[10px] w-[10px]"
                @click="toggleAcceptedTerms"
            >
                <CheckIcon
                    v-show="acceptedTerms"
                    class="h-[12px] w-[12px]"
                />
            </button>
            <small class="card_subtitle">Accept terms and conditions</small>
        </div>
    </div>
</template>