<script setup>
import { onMounted, onUnmounted, watch } from "vue"
import NavBar from "@/components/elements/NavBar.vue"
import Toasts from "@/components/elements/Toasts.vue"
import ConnectWalletModal from "@/components/elements/ConnectWalletModal.vue"
import useConnectWalletModal from "@/composables/state/connectWalletModal"
import useAuth from "@/composables/services/auth"
import useContracts from "@/composables/services/contracts"
import useUser from "@/composables/services/user"
import useWalletConnectV2 from "@/composables/services/walletConnectV2"
import Loading from "@/components/elements/Loading.vue"

const { loadingSession } = useAuth()
const { initializeContractsComposable } = useContracts()
const { user } = useUser()
const { initializeWalletConnect, uninitializeWalletConnect } = useWalletConnectV2()
const { openConnectWalletModal } = useConnectWalletModal()

watch(user, async (newUser, oldUser) => {
    // On Sign in
    if (newUser && !oldUser) {
        await initializeContractsComposable()
    } else if (newUser && oldUser) {
    // On page refresh when signed in
        await initializeContractsComposable()
    }
})

onMounted(async () => {
    await initializeWalletConnect()
})

onUnmounted(() => {
    uninitializeWalletConnect()
})

</script>

<template>
  <div class="app_container">
    <NavBar class="z-[999]" />
    <div
      v-if="!loadingSession"
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

    <ConnectWalletModal v-show="openConnectWalletModal" />
  </div>
</template>

<style scoped></style>
