<script setup>
// import useUser from "@/composables/services/user"
// const { user } = useUser()

import PieChart from "./PieChart.vue"  // Import the PieChart component

const user = {
    walletETH: 100,
    currentlyRestakedETH: 100,
    totalRewardsEarned: 5.25,
    availableToWithdrawNow: 2,
    lockedAndNotAvailable: 98,
}

const avsAllocation = {
    avs1: 25,
    avs2: 40,
    avs3: 35,
    avs4: 10
}
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
                <PieChart :avs-allocation="avsAllocation" />
            </div>

            <!-- Right: Metrics -->
            <div class="w-1/2 flex flex-col justify-around p-[12px] gap-[12px]">
                <div class="p-[12px]">
                    <h2 class="card_title">
                        Non-Staked ETH
                    </h2>
                    <p class="card_title">
                        {{ user.walletETH }} ETH
                    </p>
                </div>
                <div class="p-[12px]">
                    <h2 class="card_title">
                        Currently Restaked ETH
                    </h2>
                    <p class="card_title">
                        {{ user.currentlyRestakedETH }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Total Rewards Earned
                    </h2>
                    <p class="card_title">
                        {{ user.totalRewardsEarned }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Available to Withdraw Now
                    </h2>
                    <p class="card_title">
                        {{ user.availableToWithdrawNow }} ETH
                    </p>
                </div>

                <div class="p-[12px]">
                    <h2 class="card_title">
                        Locked and Not Available
                    </h2>
                    <p class="card_title">
                        {{ user.lockedAndNotAvailable }} ETH
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
