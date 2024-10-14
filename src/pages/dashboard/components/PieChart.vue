<script setup lang="ts">
import { Pie } from "vue-chartjs"
import {
    Chart as ChartJS,
    ChartOptions,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
} from "chart.js"
import useStaking from "@/composables/staking"
import useWallet from "@/composables/wallet"
import { computed } from "vue"
import { formatUnits } from "viem"

const { userStakeDetails } = useStaking()
const { wallet } = useWallet()

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale)

const labels = computed(() => {
    if (wallet.balance && !userStakeDetails.value.length) {
        return ["Non-Staked ETH"]
    }
    
    if (!userStakeDetails.value.length || Object.keys(userStakeDetails.value).length === 0) {
        return []
    }
    
    return [
        ...Object.keys(userStakeDetails.value).map(id => `AVS-${id}`),
        "Non-Staked ETH"
    ]
})

const data = computed(() => {
    if (wallet.balance && !userStakeDetails.value.length) {
        return [parseFloat(formatUnits(wallet.balance, 18))]
    }

    if (!userStakeDetails.value.length || Object.keys(userStakeDetails.value).length === 0) {
        return []
    }

    return [
        ...Object.keys(userStakeDetails.value).map((id: string, idx: number) => Number(userStakeDetails.value[idx].amountStaked)),
        (parseFloat(formatUnits(wallet.balance, 18)))
    ]
})

const chartData = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: "AVS Allocation",
            data: data.value,
            backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
            ],
            hoverOffset: 4,
        },
    ],
}))

const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                padding: 20,
            },
        },
        tooltip: {
            callbacks: {
                label: (tooltipItem) => {
                    const value = tooltipItem.raw || ""
                    return ` ${value} ETH`
                },
            },
        },
    },
}
</script>

<template>
    <Pie
        v-if="chartData.datasets[0].data.length > 0"
        :data="chartData"
        :options="chartOptions"
    />
    <div v-else-if="!wallet.client || !wallet.address || !wallet.balance">
        Connect your wallet to view your portfolio.
    </div>
    <div v-else>
        Loading chart data...
    </div>
</template>
