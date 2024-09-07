<script setup lang="ts">
import { formatEther } from "viem"
import useEthereum from "@/composables/ethereum"
import useAVS from "@/composables/avs"

const { strategyById } = useEthereum()
const { avsByAddress } = useAVS()
</script>

<template>
    <div
        v-for="[id, strategy] of Object.entries(strategyById)"
        :key="id"
    >
        ID: {{ id }}<br>
        Manager: {{ strategy.managerAddress }}<br>
        Registry: {{ strategy.registryAddress }}<br>
        EigenPod: {{ strategy.eigenPodAddress }}<br>
        AVS: {{ strategy.strategyConfig.serviceAddress }}<br>
        AVS Operator: {{ strategy.strategyConfig.delegateAddress }}<br>
        Deposit Fee: {{ strategy.strategyConfig.depositFee }}%<br>
        Reward Fee: {{ strategy.strategyConfig.rewardFee }}%<br>
        Total Stake: {{ formatEther(strategy.totalStake) }} ETH<br>
        User Stake: {{ formatEther(strategy.userStake) }} ETH<br>
        <br>
        <div v-if="avsByAddress[strategy.strategyConfig.serviceAddress]">
            {{ avsByAddress[strategy.strategyConfig.serviceAddress] }}
        </div>
    </div>
</template>