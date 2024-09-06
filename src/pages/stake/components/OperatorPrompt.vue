<script setup>
import useOperatorStatus from "@/composables/state/operatorStatus"
import { 
    InformationCircleIcon
} from "@heroicons/vue/24/outline"

const {
    toggleUserOperator
} = useOperatorStatus()
</script>

<template>
    <div class="card w-full h-full shadow flex flex-col items-center justify-center gap-[12px]">
        <div class="flex items-center w-full justify-center gap-[12px]">
            <small class="font-[500]">Are you an operator?</small>

            <div class="tooltip_container flex items-center">
                <InformationCircleIcon class="w-[20px] h-[20px]" />
                <div class="tooltip w-[200px]">
                    Operators are individuals with SSV nodes that validate blocks
                </div>
            </div>
        </div>


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