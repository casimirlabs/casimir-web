<script setup lang="ts">
import { ref } from "vue"
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from "@headlessui/vue"
import useWallet from "@/composables/wallet"
import useFormat from "@/composables/format"

const { 
    wallet, 
    showConnectWalletModal,
    connectWallet,
    disconnectWallet,
    toggleWalletModal 
} = useWallet()
const { copyTextToClipboard, formatAddress } = useFormat()

type ProviderString = "MetaMask" | "CoinbaseWallet" | "WalletConnect" | "Trezor" | "Ledger" | "TrustWallet"

type UserAuthFlowState = "loading" | "select_provider"| "success" | "connection_failed"

const flowState = ref<UserAuthFlowState>("select_provider")
const errorMessage = ref(false)
const errorMessageText = ref("Something went wrong, please try again later.")

const supportedWalletProviders: Array<ProviderString> = [
    "MetaMask",
    "CoinbaseWallet",
    "WalletConnect",
    "Trezor",
    "Ledger",
    "TrustWallet",
]

async function handleSelectProvider(provider: ProviderString) {
    try {
        await connectWallet(provider)
        flowState.value = "success"
        toggleWalletModal()
    } catch (err) {
        console.error(err)
        flowState.value = "connection_failed"
        errorMessage.value = true
    }
}

async function handleDisconnectWallet() {
    await disconnectWallet()
    flowState.value = "select_provider"
} 
</script>

<template>
    <TransitionRoot
        appear
        :show="showConnectWalletModal? true : false"
        as="div"
    >
        <Dialog
            as="div"
            class="relative z-10"
            @close="toggleWalletModal"
        >
            <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div
                    class="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-[2px]"
                />
            </TransitionChild>
    
            <div class="fixed inset-0 overflow-y-auto">
                <div
                    class="flex min-h-full items-center justify-center p-4 text-center"
                >
                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel
                            id="connect_wallet_modal"
                            class="connect_wallet_card transition-all"
                        >
                            <!-- SECTION: SELECT PROVIDER -->
                            <section v-if="flowState === 'select_provider'">
                                <div>
                                    <h1 class="card_title font-[500] tracking-tight">
                                        {{ flowState === 'select_provider'? 'Connect Wallet' : 'Add Wallet' }}
                                    </h1>
                                    <p class="card_subtitle">
                                        Select a wallet provider
                                    </p>
                                </div>
  
                                <div class="mt-[20px] flex flex-col gap-[12px]">
                                    <div
                                        v-for="walletProvider in supportedWalletProviders"
                                        :key="walletProvider"
                                    >
                                        <button
                                            class="flex items-center justify-between gap-5 w-full border relative px-[12px] py-[8px] shadow
                                                   rounded-[6px] bg-lightBg dark:bg-darkBg border-lightBorder dark:border-lightBorder/40
                                                 hover:bg-hover_white/30 dark:hover:bg-hover_black/30 active:bg-hover_white/60 dark:active:bg-hover_black/60"
                                            :disabled="wallet.loading"
                                            @click="handleSelectProvider(walletProvider)"
                                        >
                                            <img
                                                :src="`/${walletProvider.toLowerCase()}.svg`"
                                                :alt="`${walletProvider} logo`"
                                                class="w-[20px] h-[20px]"
                                            >
                                            <small>
                                                {{ walletProvider }}
                                            </small>
                                        </button>
                                        <!-- TODO: @Chris need a way to find out if the extenstion is not downloaded -->
                                        <!-- <div
                                              class="tooltip_container text-white"
                                          >
                                              <div class="tooltip w-[260px]">
                                              You currently do not have the extension for this wallet provider connected, click the button
                                              to take you to the wallet provider extension page.
                                              </div>
                                          </div> -->
                                    </div>
                                </div>
                                <div class="h-15 w-full text-[11px] flex items-center font-[500] mb-5 text-red">
                                    <span v-show="errorMessage">
                                        {{ errorMessageText }}
                                    </span>
                                </div>
                            </section>

                            <!-- SECTION: LOADING -->
                            <section
                                v-else-if="flowState === 'loading'"
                                class="w-full h-full"
                            >
                                <div class="flex flex-col items-center justify-center h-full w-full gap-5">
                                    <div class="h-[74px] w-[74px]">
                                        <!-- <Loading :show-text="false" /> -->
                                    </div>
                  
                                    <div class="w-full text-center">
                                        <small
                                            class="w-full card_title font-[500] tracking-tight"
                                        >
                                            Waiting on signature
                                        </small>
                                    </div>
                                </div>
                            </section>
  
                            <!-- SECTION: SUCCESS -->
                            <section
                                v-else-if="flowState === 'success'"
                                class="w-full h-full p-5 bg-lightBg dark:bg-darkBg rounded-lg"
                            >
                                <div class="flex flex-col items-center justify-center h-full w-full gap-5">
                                    <!-- Wallet Connection Information -->
                                    <div class="w-full bg-lightBg dark:bg-darkBg rounded-lg p-4 shadow">
                                        <!-- Header: Connected with MetaMask and Disconnect Button -->
                                        <div class="flex justify-between items-center mb-4">
                                            <div class="text-sm">
                                                <span class="text-gray-500">Connected with {{ wallet.provider }}</span>
                                            </div>
                                            <button
                                                class="text-sm text-blue-600 border border-blue-600 rounded px-3 py-1 hover:bg-blue-100"
                                                @click="handleDisconnectWallet"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
      
                                        <!-- Wallet Address -->
                                        <div class="flex items-center gap-2">
                                            <img
                                                :src="`/${wallet?.provider?.toLowerCase()}.svg`"
                                                :alt="`/${wallet?.provider?.toLowerCase()}.svg`"
                                                class="w-8 h-8 rounded-full"
                                            >
                                            <span class="text-lg font-medium">
                                                {{ wallet.address ? formatAddress(wallet.address) : '' }}
                                            </span>
                                        </div>
      
                                        <!-- Action Links -->
                                        <div class="flex justify-between mt-4">
                                            <!-- Copy Address Button -->
                                            <button
                                                class="text-sm text-blue-600 flex items-center gap-1"
                                                @click="wallet.address && copyTextToClipboard(wallet.address)"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9 2a1 1 0 011 1v1h4a1 1 0 011 1v2a1 1 0 110 2H7a1 1 0 01-1-1V5a1 1 0 011-1h1V3a1 1 0 011-1zM7 7V5h6v2H7z" />
                                                    <path d="M3 8a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1h4a1 1 0 001-1v-3a1 1 0 10-2 0v2H7a1 1 0 00-1 1v2H4v-8H3z" />
                                                </svg>
                                                Copy address
                                            </button>

                                            <!-- View on Etherscan Button -->
                                            <a
                                                :href="`https://etherscan.io/address/${wallet.address}`" 
                                                target="_blank"
                                                class="text-sm text-blue-600 flex items-center gap-1"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M12.293 7.293a1 1 0 011.414 1.414l-7 7a1 1 0 01-1.414-1.414l7-7zm1.707-3.586A1 1 0 0115 4v8a1 1 0 11-2 0V6.414L5.707 13.707a1 1 0 11-1.414-1.414L11.586 4H7a1 1 0 110-2h8a1 1 0 011 1z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                                View on Etherscan
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>

  
                            <!-- SECTION: CONNECTION FAILED -->
                            <section
                                v-else-if="flowState === 'connection_failed'"
                                class="w-full h-full"
                            >
                                <div class="flex flex-col items-center justify-center h-full w-full gap-5">
                                    <div class="h-[150px] w-[150px]">
                                        <!-- <Failure /> -->
                                    </div>
                  
                                    <div class="w-full text-center">
                                        <small
                                            class="w-full card_title font-[500] tracking-tight"
                                        >
                                            <span class="text-red">
                                                Something went wrong, try again later
                                            </span>
                                        </small>
                                    </div>
                                </div>
                            </section>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
  
  
<style scoped>
.loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
</style>