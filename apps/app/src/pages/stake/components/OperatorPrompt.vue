<script setup>
import useOperatorStatus from "@/composables/state/operatorStatus"

const {
    toggleUserOperator
} = useOperatorStatus()
</script>

<template>
  <div class="card w-full h-full shadow flex flex-col items-center justify-center gap-[12px]">
    <small class="font-[500]">Are you an operator?</small>
    <div class="flex items-center gap-[12px]">
      <button
        class="primary_btn"
        @click="toggleUserOperator(true)"
      >
        Yes
      </button>
      <button
        class="secondary_btn"
        @click="toggleUserOperator(false)"
      >
        No
      </button>
    </div>
  </div>
</template>

<style>
</style>