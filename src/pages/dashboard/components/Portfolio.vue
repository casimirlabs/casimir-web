<script setup>
import PieChart from "./PieChart.vue"
import { computed } from "vue"
import { formatEther } from "viem"
import useStaking from "@/composables/staking"
import useWallet from "@/composables/wallet"

const { placeholderUser, userStakeDetails } = useStaking()
const { wallet } = useWallet()

const currentlyRestaked = computed(() => {
    if (!userStakeDetails.value || Object.keys(userStakeDetails.value).length === 0) {
        return 0
    }

    return Object.keys(userStakeDetails.value).reduce((acc, id) => {
        return acc + Number(userStakeDetails.value[id].amountStaked)
    }, 0)
})
</script>

<template>
    <div class="card w-full h-full shadow p-[24px] flex flex-col items-start justify-around gap-[24px]">
        <!-- Header Section -->
        <div>
            <h1 class="card_title">
                Portfolio
            </h1>
            <p class="card_subtitle">
                View and manage your AVS restaking portfolio.
            </p>
        </div>

        <!-- Main Content Section -->
        <div class="w-full h-[400px] flex">
            <!-- Left: Pie Chart -->
            <div class="w-1/2 flex items-center justify-center">
                <PieChart />
            </div>

            <!-- Right: Metrics -->
            <div class="w-1/2 flex flex-col justify-around p-[12px] gap-[12px]">
                <div class="p-[12px]">
                    <h2 class="card_title">
                        Non-Staked ETH
                    </h2>
                    <p class="card_title">
                        {{ formatEther(wallet.balance) }} ETH
                    </p>
                </div>
                <div class="p-[12px]">
                    <h2 class="card_title">
                        Currently Restaked ETH
                    </h2>
                    <p class="card_title">
                        {{ currentlyRestaked }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Total Rewards Earned
                    </h2>
                    <p class="card_title">
                        <!-- TODO: Replace placeholderUser and make dynamic -->
                        {{ placeholderUser.totalRewardsEarned }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Available to Withdraw Now
                    </h2>
                    <p class="card_title">
                        <!-- TODO: Replace placeholderUser and make dynamic -->
                        {{ placeholderUser.availableToWithdrawNow }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Locked and Not Available
                    </h2>
                    <p class="card_title">
                        <!-- TODO: Replace placeholderUser and make dynamic -->
                        {{ placeholderUser.lockedAndNotAvailable }} ETH
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
