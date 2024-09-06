<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue"
import useEthereum from "./composables/ethereum"

const { initialized: ethereumInitialized, initialize: initializeEthereum } = useEthereum()

onMounted(async () => {
    if (!ethereumInitialized.value) {
        await initializeEthereum()
    }
})
</script>

<template>
    <div class="app_container">
        <NavBar class="z-[999]" />
        <div
            v-if="ethereumInitialized"
            class="app_container_inner z-[888]"
        >
            <div>
                <router-view />
            </div>
            <Toasts />
        </div>


        <div
            v-else
            class="overflow-hidden opacity-50"
            style="height: calc(100vh - 300px);"
        >
            <Loading :show-text="false" />
        </div>
    </div>
</template>

<style scoped></style>
