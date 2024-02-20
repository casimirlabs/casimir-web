<script setup>
import { ref } from "vue"
import useUser from "@/composables/services/user"
import useOperator from "@/composables/services/operator"
import useFormat from "@/composables/services/format"
import { 
    XMarkIcon
} from "@heroicons/vue/24/outline"
import useOperatorStatus from "@/composables/state/operatorStatus.ts"


const { registerOperatorModalIsOpen } = useOperatorStatus()

const { user } = useUser()
const { convertString, formatEthersCasimir, formatDecimalString } = useFormat()

const registerOperatorAddress = ref(null)
const openSelectOperatorModal = ref(false)
const { 
    nonregisteredBaseOperators,
    nonregisteredEigenOperators,
    registeredBaseOperators,
    registeredEigenOperators,
    registerOperatorWithCasimir
} = useOperator()

const selectedOperatorID = ref(null)
const openSelectOperatorIdModal = ref(false)

const selectedDKGURL = ref(null)


const formattedCollateralAmount = ref(null)
const handleInputCollateralAmount = (event) => {
    let value = event.target.value

    value = value.replace(/[^\d,.]/g, "")

    value = value.replace(/,{2,}/g, ",")

    value = value.replace(/\.{2,}/g, ".")

    // const numericValue = parseFloat(value.replace(/,/g, ""))
    formattedCollateralAmount.value = formatInput(value)
}
const formatInput = (value) => {
    const parts = value.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
}



const errorMessage = ref(null)
const showErrorBorder = ref(false)
const clearErrorMessage = () => {
    setTimeout(() => {
        errorMessage.value = null
        showErrorBorder.value = false
    }, 3500)
}

const handleSubmit = () => {
    if (
        !registerOperatorAddress.value ||
        !selectedOperatorID.value ||
        !formattedCollateralAmount.value ||
        !selectedDKGURL.value 
    ) {
        showErrorBorder.value = true
        errorMessage.value = "Please fill out all of the inputs before submitting"
        clearErrorMessage()
        return
    }

    
    const walletProvider = user.value?.accounts.find(account => account.address === registerOperatorAddress.value)?.walletProvider
    registerOperatorWithCasimir({
        walletProvider,
        address: registerOperatorAddress.value,
        operatorId: selectedOperatorID.value.id,
        collateral: formattedCollateralAmount.value,
        nodeURL: selectedDKGURL.value
    })
    registerOperatorModalIsOpen.value = false
}
</script>

<template>
  <div>
    <div class="text-left pb-[24px] border-b border-b-lightBorder dark:border-b-darkBorder">
      <h1 class="card_title">
        Register Node
      </h1>
      <p class="card_subtitle">
        Register your SSV node to validate blocks on Casimir
      </p>
    </div>

    <!-- if docs page show link -->

    <div class="w-full text-left my-[24px] outline-none">
      <label for="wallet_selection"><caption class="font-[500]">Address</caption></label>
      <div
        ref="wallet_selection"
        class="input_container outline-none"
        :class="showErrorBorder && !registerOperatorAddress? 'border border-red' : 'input_container_border'"
      > 
        <button 
          id="input_selector_button"
          class="flex items-center justify-between gap-[8px] w-full h-full outline-none"
          :class="registerOperatorAddress ? 'text-black' : 'text-grey_4'"
          @click="openSelectOperatorModal = !openSelectOperatorModal"
        >
          <div
            v-if="registerOperatorAddress"
            class="tooltip_container w-full outline-none text-left"
          >
            <small class="dark:text-white">
              {{ convertString(registerOperatorAddress) }} 
            </small>
          </div>
          <small v-else>Select address</small>
          <img
            :src="isDark? '/expand_icon_light.svg':'/expand_icon_dark.svg'"
            alt="Expand Icon"
            class="w-[6.25px] h-[10.13px]"
          >
        </button>
        <div 
          v-show="openSelectOperatorModal"
          id="input_selector"
          class="input_selector"
          style="max-height: 250px;"
        >
          <div class="p-[8px] ">
            <caption
              v-if="user"
              class="text-gray_1 whitespace-nowrap font-[600]"
            >
              Primary Wallet
            </caption>

            <button
              v-if="user"
              class="w-full mt-[8px] rounded-[3px] flex items-center
                justify-between px-[8px] py-[6px] hover:bg-gray_4 dark:hover:bg-gray_5"
              @click="registerOperatorAddress = user?.address, openSelectOperatorModal = false"
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

              <div class="tooltip_container_left">
                {{ formatEthersCasimir(formatDecimalString(user?.accounts[user.accounts.findIndex(item => item.address == user.address)]?.balance)) }} ETH
                <div class="tooltip_left w-[100px] truncate whitespace-nowrap">
                  {{ user?.accounts[user.accounts.findIndex(item => item.address == user.address)]?.balance }}
                </div>
              </div>
            </button>

            <div
              v-else
              class="mt-[12px] flex justify-center"
            >
              <small class="text-red">No Wallets Connected</small>
            </div>
          </div>
          <div
            v-if="user?.accounts?.length > 1"
            class="p-[8px]"
          >
            <caption class="text-gray_1 whitespace-nowrap font-[600]">
              Secondary Wallet(s)
            </caption>
            <button
              v-for="(account, index) in userSecondaryAccounts"
              :key="index"
              class="w-full mt-[8px] rounded-[3px] flex items-center
                      justify-between px-[8px] py-[6px] hover:bg-gray_4 dark:hover:bg-gray_5 overflow-hidden"
              @click="registerOperatorAddress = account.address, openSelectOperatorModal = false"
            >
              <div class="flex items-center gap-[8px]">
                <div class="w-[20px] h-[20px]">
                  <img
                    :src="`/${account.walletProvider.toLowerCase()}.svg`"
                    :alt="`/${account.walletProvider.toLowerCase()}.svg`"
                    class="block w-full h-full max-w-full"
                  >
                </div>

                <div class="card_title font-[400] mb-0">
                  {{ convertString(account.address) }}
                </div>
              </div>
              <div class="tooltip_container_left">
                {{ formatEthersCasimir(formatDecimalString(account.balance)) }} ETH
                <div class="tooltip_left w-[100px] truncate whitespace-nowrap">
                  {{ account.balance }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full text-left my-[24px]">
      <label for="wallet_selection"><caption class="font-[500] whitespace-nowrap">Operator ID</caption></label>
      <div
        ref="wallet_selection"
        class="input_container "
        :class="showErrorBorder && !selectedOperatorID? 'border border-red' : 'input_container_border'"
      > 
        <button 
          id="input_selector_button"
          class="flex items-center justify-between gap-[8px] w-full h-full outline-none"
          :class="selectedOperatorID ? 'text-black' : 'text-grey_4'"
          @click="openSelectOperatorIdModal = !openSelectOperatorIdModal"
        >
          <div
            v-if="selectedOperatorID"
            class="w-full outline-none text-left"
          >
            <small class="dark:text-white">
              {{ selectedOperatorID.id }} 
            </small>
          </div>
          <small v-else>Select operator ID</small>
          <img
            :src="isDark? '/expand_icon_light.svg':'/expand_icon_dark.svg'"
            alt="Expand Icon"
            class="w-[6.25px] h-[10.13px]"
          >
        </button>
        <div 
          v-show="openSelectOperatorIdModal"
          id="input_selector"
          class="input_selector"
          style="height: 180px;"
        >
          <div
            v-if="!nonregisteredBaseOperators || nonregisteredBaseOperators.length <= 0"
            class="mt-[12px] flex justify-center"
          >
            <small class="text-red">No IDs Available</small>
          </div>
          <div v-else>
            <caption class="text-gray_1 whitespace-nowrap font-[600]">
              Available IDs
            </caption>

            <button 
              v-for="id in nonregisteredBaseOperators"
              :key="id"
              class="w-full mt-[8px] rounded-[3px] flex items-center
                      justify-between px-[8px] py-[6px] hover:bg-gray_4 dark:hover:bg-gray_5 overflow-hidden"
              @click="selectedOperatorID = id, openSelectOperatorIdModal = false"
            >
              <div 
                class="card_title font-[400] mb-0"
              >
                {{ id.id }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <div class="w-full text-left my-[24px]">
      <label for="wallet_selection"><caption class="font-[500] whitespace-nowrap">DKG URL</caption></label>
      <div
        ref="wallet_selection"
        class="input_container "
        :class="showErrorBorder && !selectedDKGURL? 'border border-red' : 'input_container_border'"
      > 
        <input 
          id="input_selector_button"
          v-model="selectedDKGURL"
          type="text"
          placeholder="Type DKG URL"
          class="flex items-center text-[14.22px] justify-between gap-[8px] w-full h-full outline-none bg-transparent"
          :class="selectedOperatorID ? 'text-black' : 'text-grey_4'"
        >
        <button
          class="input_selector_button"
          @click="selectedDKGURL = null"
        >
          <XMarkIcon class="w-[10px] h-[10px]" />
        </button>
      </div>
    </div>

    <div class="w-full text-left">
      <label for="amount_selector"><caption class="font-[500] whitespace-nowrap">Collateral Amount</caption></label>
      <div
        ref="amount_selector"
        class="input_container"
        :class="showErrorBorder && !formattedCollateralAmount? 'border border-red' : 'input_container_border'"
      > 
        <div class="flex items-center gap-[8px] w-full">
          <input
            id="amount_input"
            v-model="formattedCollateralAmount"
            type="text"
            pattern="\d+(\.\d{1,18})?"
            placeholder="0.00"
            class="outline-none bg-transparent w-full"
            @input="handleInputCollateralAmount"
          >
        </div>
        <div class="flex items-center gap-[4px]">
          <small class="font-[500]">
            ETH
          </small>
        </div>
      </div>
    </div>

    <div
      class="h-[50px] w-full"
    >
      <div 
        :class="errorMessage? 'opacity-100' : 'opacity-0'"
        style="transition: all 0.6s ease-in;"
      >
        <caption class="text-red font-[500] whitespace-nowrap">
          {{ errorMessage }}
        </caption>
      </div>
    </div>

    <div class="w-full pt-[12px] border-t border-t-lightBorder dark:border-t-darkBorder">
      <button
        class="primary_btn w-full mt-[8px]"
        @click="handleSubmit"
      >
        <small class="font-[500]">Submit</small>
      </button>
    </div>
  </div>
</template>

<style>
</style>