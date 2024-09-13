<script setup lang="ts">
import Portfolio from "@/pages/dashboard/components/Portfolio.vue"
import AVSTable from "@/pages/dashboard/components/AVSTable.vue"
import AVSStage from "@/pages/dashboard/components/AVSStage.vue"
import ActivelyStaked from "./components/ActivelyStaked.vue"
</script>

<template>
    <div>
        <div class="flex items-start gap-[24px] h-[530px] 900s:flex-wrap-reverse 900s:h-[1044px]">
            <div class="w-9/12 h-full 900s:w-full 900s:h-[530px] min-w-[300px]">
                <Portfolio />
            </div>
            <div class="w-3/12 h-full 900s:w-full 900s:h-[530px]">
                <AVSTable />
            </div>
        </div>
        <div class="w-full mt-[24px]">
            <AVSStage />
        </div>
        <div class="w-full mt-[24px] h-[540px]">
            <ActivelyStaked />
        </div>
    </div>
</template>