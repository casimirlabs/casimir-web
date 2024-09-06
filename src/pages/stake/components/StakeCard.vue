<script setup>
import { ref } from "vue"
import useStakingState from "@/composables/state/staking"
import useUser from "@/composables/services/user"
import useFormat from "@/composables/services/format"
import { 
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/vue"
import {  CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/24/outline"
import useToasts from "@/composables/state/toasts"

// eslint-disable-next-line no-undef
const props = defineProps({
    closeStakeWithAVSModal: {
        type: Function,
        required: true,
    }
})

const {
    stakingWalletAddress,
    eigenLayerSelection,
    toggleEigenlayerSelection,
    selectWallet,
    setAmountToStake,
    acceptTerms,
    toggleTerms,
    handleStake,
    depositFees
} = useStakingState()

const { addToast } = useToasts()

const { user } = useUser()
const selectedWallet = ref(null)
const { convertString, formatEthersCasimir, formatDecimalString } = useFormat()

const errorMessage = ref(null)

const showErrorBorder = ref(false)
const formatedAmountToStake = ref(null)

const handleInputAmountToStake = (event) => {
    let value = event.target.value

    value = value.replace(/[^\d,.]/g, "")

    value = value.replace(/,{2,}/g, ",")

    value = value.replace(/\.{2,}/g, ".")

    const numericValue = parseFloat(value.replace(/,/g, ""))
    setAmountToStake(isNaN(numericValue) ? 0 : numericValue)
    formatedAmountToStake.value = formatInput(value)
}

const formatInput = (value) => {
    const parts = value.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
}

const clearErrorMessage = () => {
    setTimeout(() => {
        errorMessage.value = null
        showErrorBorder.value = false
    }, 3500)
}

const checkBalance = () => {
    const index = user?.value?.accounts?.findIndex(item => item == stakingWalletAddress.value)
    const accountBalance = user?.value?.accounts[index].balance
    if (index > -1) {
        if (accountBalance <= formatedAmountToStake.value) {
            return true
        }
    }
    return false
}

const handleStakingAction = async() => {
    if (!stakingWalletAddress.value || !formatedAmountToStake.value) {
        errorMessage.value = "Please fill out all of the inputs before staking"
        showErrorBorder.value = true
        clearErrorMessage()

        if (checkBalance()) {
            errorMessage.value = "Insufficient Funds"
            showErrorBorder.value = true
            clearErrorMessage()
            return
        }

        return
    } 
  
    if (!acceptTerms.value) {
        errorMessage.value = "Please accept the terms and conditions before staking"
        clearErrorMessage()
        return
    }
  
    await handleStake()

    setAmountToStake(null)
    selectWallet(null)
    formatedAmountToStake.value = null
}

</script>

<template>
    <div>
        <div class="w-full text-left">        
            <Listbox v-model="selectedWallet">
                <div class="relative mt-1">
                    <ListboxButton
                        class="relative w-full input_container"
                        :class="showErrorBorder? 'border border-red' : 'input_container_border'"
                    >
                        <div class="p-[4px]">
                            <div
                                v-if="stakingWalletAddress"
                                class="tooltip_container"
                            >
                                <small class="dark:text-white">
                                    {{ convertString(stakingWalletAddress) }} 
                                    ({{ formatEthersCasimir(formatDecimalString(user?.accounts[user?.accounts.findIndex(item => item.address == stakingWalletAddress)].balance)) }}) ETH
                                </small>
                                <div class="tooltip whitespace-nowrap">
                                    <small>{{ user?.accounts[user?.accounts.findIndex(item => item.address == stakingWalletAddress)].balance }}</small>
                                </div>
                            </div>
                            <div v-else>
                                <small>Select Wallet</small>
                            </div>
                            <span
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                            >
                                <ChevronUpDownIcon
                                    class="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </div>
                    </ListboxButton>

                    <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <ListboxOptions
                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-darkBg py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                        >
                            <div
                                v-if="!user || user?.accounts.length === 0"
                                class="px-[12px]"
                            >
                                <small>No Wallets Connected</small>
                            </div>
                            <div v-else>
                                <ListboxOption
                                    v-for="account in user.accounts"
                                    v-slot="{ active, selected }"
                                    :key="account"
                                    :value="avs"
                                    as="template"
                                >
                                    <li
                                        :class="[
                                            active ? 'bg-gray_3 dark:bg-black/70 text-black dark:text-white' : 'text-gray-900 dark:text-white',
                                            'relative cursor-default select-none py-2 pl-10 pr-4',
                                        ]"
                                    >
                                        <span
                                            v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-black dark:text-white"
                                        >
                                            <div class="flex items-center gap-[8px]">
                                                <div class="w-[20px] h-[20px]">
                                                    <img
                                                        :src="`/${user?.walletProvider.toLowerCase()}.svg`"
                                                        :alt="`/${user?.walletProvider.toLowerCase()}.svg`"
                                                        class="block w-full h-full max-w-full"
                                                    >
                                                </div>

                                                <div class="card_title font-[400] mb-0 text-gray_5">
                                                    {{ user?.address? convertString(user?.address) : '___' }}
                                                </div>
                                            </div>
                                            <CheckIcon
                                                class="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </div>
                        </ListboxOptions>
                    </transition>
                </div>
            </Listbox>
        </div>

        <div class="w-full text-left mt-[24px]">
            <div
                ref="amount_selector"
                class="input_container"
                :class="showErrorBorder && !formatedAmountToStake? 'border border-red' : 'input_container_border'"
            > 
                <div class="flex items-center gap-[8px] w-full">
                    <input
                        id="amount_input"
                        v-model="formatedAmountToStake"
                        type="text"
                        pattern="\d+(\.\d{1,18})?"
                        placeholder="0.00"
                        class="outline-none bg-transparent w-full p-[4px]"
                        @input="handleInputAmountToStake"
                    >
                </div>
                <div class="flex items-center gap-[4px]">
                    <small class="font-[500]">
                        ETH
                    </small>
                </div>
            </div>
        </div>

    
        <div class="flex items-center justify-between w-full mt-[24px]">
            <small class="font-[500]">Fees</small>
            <small class="font-[500]">{{ depositFees? depositFees : '- -' }}%</small>
        </div>

        <div class="w-full">
            <div
                class="h-[24px] w-full mt-[6px]"
            >
                <div 
                    :class="errorMessage? 'opacity-100' : 'opacity-0'"
                    style="transition: all 0.6s ease-in;"
                >
                    <small class="text-red font-[500]">{{ errorMessage }}</small>
                </div>
            </div>
        </div>

        <div class="w-full">
            <div class="flex items-center gap-[12px] mb-6">
                <button
                    class="checkbox_button bg-transparent"
                    @click="toggleTerms"
                >
                    <CheckIcon
                        v-show="acceptTerms"
                        class="h-[14px] w-[14px]"
                    />
                </button>
                <small>Accept terms and conditions</small>
            </div>
            <button
                class="primary_btn w-full mt-[8px]"
                @click="handleStakingAction"
            >
                <small class="font-[500] p-[4px]">Stake</small>
            </button>
        </div>
    </div>
</template>