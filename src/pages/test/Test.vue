<script setup lang="ts">
import useEthereum from "@/composables/ethereum"

const { strategyById } = useEthereum()
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
        Total Stake: {{ strategy.totalStake }}
    </div>
</template>