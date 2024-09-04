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
import { defineProps } from "vue"

type AvsAllocation = {
  [key: string]: number;
};

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale)

const props = defineProps({
    avsAllocation: {
        type: Object as () => AvsAllocation,
        required: true,
    },
})

const labels = Object.keys(props.avsAllocation)
const data = Object.values(props.avsAllocation)

const chartData = {
    labels: labels,
    datasets: [
        {
            label: "AVS Allocation",
            data: data,
            backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
            ],
            hoverOffset: 4,
        },
    ],
}

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
    :data="chartData"
    :options="chartOptions"
  />
</template>
