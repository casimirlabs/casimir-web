<script setup>
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline"
import { useDark, useToggle } from "@vueuse/core"
import useWallet from "@/composables/wallet"
import useFormat from "@/composables/format"

const { wallet, toggleWalletModal } = useWallet()
const { formatAddress, formatEthBalance } = useFormat()

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
    <div class="nav_bar_container">
        <div class="nav_bar_inner">
            <!-- Logo / Home path -->
            <div
                class="flex items-center gap-[24px] w-full"
            >
                <router-link
                    to="/"
                    class="h-[16px] w-[19.56px]"
                >
                    <img
                        v-if="isDark"
                        src="/casimir.svg"
                        alt="Casimir Logo"
                        class="h-[16px] w-[19.56px];"
                    >
                    <img
                        v-else
                        src="/casimir-dark.svg"
                        alt="Casimir Logo"
                        class="h-[16px] w-[19.56px];"
                    >
                </router-link>
            </div>

            <div class="flex items-center justify-end gap-[24px] w-full">
                <!-- Toggle Dark Mode -->
                <button @click="toggleDark()">
                    <SunIcon
                        v-if="isDark"
                        class="nav_icon"
                    />
                    <MoonIcon
                        v-else
                        class="nav_icon"
                    />
                </button>

                <!-- Connect Wallet Button -->
                <div class="w-[240px]">
                    <div class="relative inline-block text-left w-full">
                        <button
                            class="connect_wallet_menu_btn"
                            @click="toggleWalletModal()"
                        >
                            <div
                                v-if="wallet.client && wallet.address && wallet.balance"
                                class="flex items-center align-middle justify-between w-full"
                            >
                                <div class="flex items-center gap-[8px] w-full">
                                    <div class="w-[20px] h-[20px]">
                                        <img
                                            :src="`/${wallet?.provider?.toLowerCase()}.svg`"
                                            :alt="`/${wallet?.provider?.toLowerCase()}.svg`"
                                            class="block w-full h-full max-w-full rounded-full"
                                        >
                                    </div>

                                    <div class="card_title font-[400] mb-0">
                                        {{ formatAddress(wallet.address) }}
                                    </div>
                                    
                                    <div class="card_title font-[400] mb-0">
                                        {{ formatEthBalance(wallet.balance) }} ETH
                                    </div>
                                </div>
                            </div>

                            <div
                                v-else
                                class="flex items-center justify-between w-full"
                            >
                                <small class="my-[2px] w-full">Connect Wallet</small>
                            </div> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-enter, .slide-enter-active {
  animation: slide_in 0.3s ease-in;
}

@keyframes slide_in {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

.slide-leave, .slide-leave-to {
  animation: slide_out 0.2s ease-in;
}
@keyframes slide_out {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
