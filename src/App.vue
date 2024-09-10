<script setup lang="ts">
import NavBar from "@/components/NavBar.vue"
import Toasts from "@/components/Toasts.vue"
import ConnectWalletModal from "@/components/ConnectWalletModal.vue"
import useWallet from "@/composables/wallet"

const { showConnectWalletModal } = useWallet()

</script>

<template>
    <div class="app_container">
        <NavBar class="z-[999]" />
        <ConnectWalletModal v-show="showConnectWalletModal" />
        <div
            class="app_container_inner z-[888]"
        >
            <div>
                <router-view />
            </div>
            <Toasts />
        </div>
    </div>
</template>

<style scoped></style>
