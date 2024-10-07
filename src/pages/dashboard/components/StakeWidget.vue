<script setup lang="ts">
import { formatEther } from "viem"
import { CheckIcon } from "@heroicons/vue/24/outline"
import useStaking from "@/composables/staking"
import useToasts from "@/composables/toasts"
import useWallet from "@/composables/wallet"
import { computed } from "vue"

const { acceptedTerms, amountToStake, setAmountToStake, stage, stake, toggleAcceptedTerms } = useStaking()
const { addToast, generateRandomToastId } = useToasts()
const { wallet } = useWallet()

const formattedWalletBalance = computed(() => wallet.provider ? formatEther(wallet.balance) : "0")

function onAmountChange(event: Event) {
    const input = event.target as HTMLInputElement
    const value = parseFloat(input.value)
    if (!isNaN(value) && value <= parseFloat(formatEther(wallet?.balance))) {
        setAmountToStake(value.toString())
    } else {
        setAmountToStake(formatEther(wallet.balance))
    }
}

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
</script>

<template>
    <div class="card flex flex-col justify-between p-[24px] w-full shadow">
        <!-- Amount to Stake -->
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
                    v-model.number="amountToStake"
                    type="number"
                    class="input_container"
                    :max="formattedWalletBalance || '0'"
                    min="0"
                    placeholder="0"
                    @input="onAmountChange"
                >
                <button
                    class="secondary_btn absolute inset-y-0 right-0 flex items-center px-4 text-sm rounded-r-l"
                    @click="setAmountToStake(formattedWalletBalance)"
                >
                    Max
                </button>
            </div>
            <p class="text-gray-400 text-sm mt-2">
                Available Balance: <span class="font-semibold">{{ wallet.provider ? formatEther(wallet?.balance) : '' }} ETH</span>
            </p>
        </div>

        <div>
            <!-- Terms and Conditions -->
            <div class="flex items-center gap-[12px] my-6">
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

            <!-- Stake Button -->
            <div>
                <button
                    class="primary_btn w-full"
                    :class="{ 'disabled-btn': !stage.length }"
                    @click="handleStake"
                >
                    <small>Stake</small>
                </button>
            </div>
        </div>
    </div>
</template>
