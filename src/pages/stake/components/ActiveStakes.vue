<script setup>
import { 
    InformationCircleIcon,
    AdjustmentsVerticalIcon,
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon
} from "@heroicons/vue/24/outline"
import { ref, computed, onMounted } from "vue"
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    Switch
} from "@headlessui/vue"
import useFormat from "@/composables/services/format"
import useUser from "@/composables/services/user"
import { useStorage } from "@vueuse/core"
import useStakingState from "@/composables/state/staking"

// TODO: Refactor to use userStakeDetails instead of sampleUserStakeDetails
const {
    setWithdrawAmount,
    handleWithdraw,
    userStakeDetails,
    sampleUserStakeDetails
} = useStakingState()


const { user } = useUser()
const { convertString, formatEthersCasimir, formatDecimalString } = useFormat()
const columns = [
    { title: "Address", show: ref(true), value: "address" }, 
    { title: "Total Staked", show: ref(true), value: "amountStaked" }, 
    { title: "Rewards", show: ref(true), value: "rewards" }, 
    { title: "EigenLayer", show: ref(true), value: "operatorType" }, 
    { title: "Available to Withdraw", show: ref(true), value: "availableToWithdraw" }, 
    { title: "Withdrawals Initiated", show: ref(true), value: "WithdrawalInitiated" }, 
    { title: "Withdrawals Requested", show: ref(true), value: "WithdrawalRequested" }, 
    { title: "Withdrawals Fulfilled", show: ref(true), value: "WithdrawalFulfilled" }, 
    // Removed for now
    // { title: "Timestamp", show: ref(true), value: "timestamp" }, 
    // { title: "Age", show: ref(false), value: "age" }, 
    // { title: "Status", show: ref(true), value: "status" }, 
]

const tableHeaders = ref(columns)
useStorage("chosenActiveStakeTableHeaders", tableHeaders.value)


const toggleColumnShowItem = (item) =>{
    const index = columns.findIndex((col) => col === item)

    if (index > -1) {
        columns[index].show = ref(!item.show.value)
        tableHeaders.value = columns
    } else return
    
    tableHeaders.value = columns.map((col) => ({
        title: col.title,
        show: ref(col.show.value),
        value: col.value
    }))  
}


const openColumnsConfigurations = ref(false)


const closeColumnsConfigurationsModal = () => {
    openColumnsConfigurations.value = false
}
const  openColumnsConfigurationsModal = () => {
    openColumnsConfigurations.value = true
}

const openActiveStakeOptions = ref(false)


const closeOpenActiveStakeOptions = () => {
    openActiveStakeOptions.value = false
}
const  openOpenActiveStakeOptions = () => {
    openActiveStakeOptions.value = true
}



const currentPage = ref(1)
const itemsPerPage = ref(9)
const pagesAvailable = computed(() => {
    const pages = Math.ceil(sampleUserStakeDetails?.value?.length / itemsPerPage.value)
    return pages > 0 ? pages : 1
})

const goToStartPage = () => {
    currentPage.value = 1
}
const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value --
    }
}
const goToNextPage = () => {
    if (currentPage.value < pagesAvailable.value) {
        currentPage.value ++
    }
}
const goToLastPage = () => {
    currentPage.value = pagesAvailable.value
}

const getWalletProviderByAddress = (address) => {
    const index = user?.value?.accounts?.findIndex(item => item.address == address)
    if (index > -1) {
        return "/"+user.value.accounts[index].walletProvider.toLowerCase() + ".svg"
    }
    return false
}

const formatedAmountToWithdraw = ref(null)
const selectedStake = ref(null)


const handleInputAmountToWithdraw = (event) => {
    let value = event.target.value

    value = value.replace(/[^\d,.]/g, "")

    value = value.replace(/,{2,}/g, ",")

    value = value.replace(/\.{2,}/g, ".")

    const numericValue = parseFloat(value.replace(/,/g, ""))
    setWithdrawAmount(isNaN(numericValue) ? 0 : numericValue)
    formatedAmountToWithdraw.value = formatInput(value)
}

const formatInput = (value) => {
    const parts = value.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
}

const clearErrorMessage = () => {
    setTimeout(() => {
        errorMessage.value = null
    }, 3500)
}

const filteredStakeDetail = computed(() => {
    if (sampleUserStakeDetails.value?.length > itemsPerPage.value) {
        return sampleUserStakeDetails.value?.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value)
    } else {
        return sampleUserStakeDetails.value
    }
})

const errorMessage = ref(null)
const handleWithdrawAction = () => {
    if (formatedAmountToWithdraw.value >  selectedStake.value.availableToWithdraw) {
        errorMessage.value= "Insufficient withdrawal amount"
        clearErrorMessage()
        return
    }

    handleWithdraw(selectedStake.value)
    closeOpenActiveStakeOptions()

}

const findSwitchHeaderValue = (switchItem) => {
    const index = tableHeaders.value.findIndex(item => item.title == switchItem.title)
    return tableHeaders.value[index].show
}
</script>

<template>
  <div class="card w-full h-full shadow p-[24px] flex flex-col items-start justify-between gap-[24px]">
    <!-- Header and Table Filter -->
    <div class="w-full flex items-center justify-between">
      <div class="flex items-center gap-[8px]">
        <h1 class="card_title">
          Actively Staked
        </h1>
        <div class="mb-[3px] tooltip_container">
          <InformationCircleIcon class="w-[20px] h-[20px]" />
          <div class="tooltip w-[200px]">
            Select a previous stake to view more details and/or withdraw your rewards.
          </div>
        </div>
      </div>
      <button
        class="secondary_btn shadow-none"
        @click="openColumnsConfigurationsModal()"
      >
        <AdjustmentsVerticalIcon class="w-[20px] h-[20px]" />
      </button>
    </div>

    <!-- Table -->
    <div class="w-full h-full">
      <div class="w-full border border-lightBorder dark:border-darkBorder rounded-[6px] overflow-x-auto">
        <table class="w-full overflow-x-auto">
          <thead>
            <tr class="border-b border-b-lightBorder dark:border-b-darkBorder">
              <th
                v-for="item in tableHeaders"
                v-show="item.show"
                :key="item.value"
                class="py-[8px] text-left px-[8px] whitespace-nowrap"
              >
                <small class="font-[300]">
                  {{ item.title }}
                </small>
              </th>
            </tr>
          </thead>
          <tbody
            class="w-full"
          >
            <tr
              v-for="stake in filteredStakeDetail"
                
              :key="stake"
              class="hover:bg-gray_4 dark:hover:bg-gray_6 cursor-pointer whitespace-nowrap"
              @click="openOpenActiveStakeOptions(), selectedStake = stake"
            >
              <td
                v-for="(item, index) in tableHeaders"
                v-show="item.show"
                :key="index"
                class="border-b py-[8px] border-b-lightBorder dark:border-b-darkBorder"
              >
                <div
                  v-if="item.value === 'address'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  <div
                    v-if="!getWalletProviderByAddress(stake[item.value])"
                    class="placeholder_avatar"
                  />
                  <div 
                    v-else
                    class="w-[20px] h-[20px]"
                  >
                    <img
                      :src="getWalletProviderByAddress(stake[item.value])"
                      alt=""
                      class="w-[20px] h-[20px]"
                    >
                  </div>
                  <small>
                    {{ convertString(stake[item.value] ) }}
                  </small>
                </div>
  
                <div
                  v-if="
                    item.value === 'amountStaked' ||
                      item.value === 'rewards' ||
                      item.value === 'availableToWithdraw' ||
                      item.value === 'WithdrawalInitiated' ||
                      item.value === 'WithdrawalRequested' ||
                      item.value === 'WithdrawalFulfilled' 
                  "
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  <div class="tooltip_container_left">
                    <small>
                      {{ 
                        formatEthersCasimir(formatDecimalString(stake[item.value]))
                      }} ETH
                    </small>
                    <div class="tooltip_left whitespace-nowrap">
                      {{ 
                        stake[item.value]
                      }}
                    </div>
                  </div>
                </div>
  
                <div
                  v-if="item.value === 'operatorType'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  <small>
                    {{ stake[item.value] == "default"? 'Disabled' : 'Enabled' }}
                  </small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      class="flex items-center justify-between gap-[15px] w-full px-[8px]"
    >
      <div class="text-[#71717a] text-[12px] font-[400]">
        Page {{ currentPage }} of {{ pagesAvailable }}
      </div>
      <div class="flex items-center gap-[5px] text-[#71717a]">
        <button
          class="border border-[#e4e4e7] rounded-[6px] p-[4px] 
            hover:bg-[#F4F4F5] cursor-pointer"
          @click="goToStartPage()"
        >
          <ChevronDoubleLeftIcon class="h-[14px] w-[14px]" />
        </button>
        <button
          class="border border-[#e4e4e7] rounded-[6px] p-[4px] 
            hover:bg-[#F4F4F5] cursor-pointer"
          @click="goToPreviousPage()"
        >
          <ChevronLeftIcon class="h-[14px] w-[14px]" />
        </button>
        <button
          class="border border-[#e4e4e7] rounded-[6px] p-[4px] 
            hover:bg-[#F4F4F5] cursor-pointer"
          @click="goToNextPage()"
        >
          <ChevronRightIcon class="h-[14px] w-[14px]" />
        </button>
        <button
          class="border border-[#e4e4e7] rounded-[6px] p-[4px] 
            hover:bg-[#F4F4F5] cursor-pointer"
          @click="goToLastPage()"
        >
          <ChevronDoubleRightIcon class="h-[14px] w-[14px]" />
        </button>
      </div>
    </div>

    <!-- Table Configurations -->
    <TransitionRoot
      appear
      :show="openColumnsConfigurations"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeColumnsConfigurationsModal"
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
          <div class="fixed inset-0 bg-black/25" />
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
                class="card w-full max-w-[360px] p-[24px]"
              >
                <div class="text-left pb-[24px] border-b border-b-lightBorder dark:border-b-darkBorder">
                  <h1 class="card_title">
                    Configure Columns
                  </h1>
                  <p class="card_subtitle">
                    Change the layout of the transaction list and display only the columns and information that is most important to you.
                  </p>
                </div>

                <div class="mt-4">
                  <div
                    v-for="(item, index) in columns"
                    :key="index"
                    class="w-full flex items-center justify-between mt-[10px] text-[14px] font-[500] tracking-[0.15px] text-[#71717a]"
                  >
                    {{ item.title }}
                    <div class="flex items-center gap-[12px] text-[12px]">
                      <Switch
                        :class="findSwitchHeaderValue(item)? 'bg-black dark:bg-white' : ' bg-gray_1 dark:bg-gray_6'"
                        class="switch_container"
                        @click="toggleColumnShowItem(item)"
                      >
                        <span class="sr-only">Use setting</span>
                        <span
                          aria-hidden="true"
                          :class="columns[index].show.value ? 'translate-x-4' : 'translate-x-0'"
                          class="switch_ball"
                        />
                      </Switch>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Active Stake Options -->
    <TransitionRoot
      appear
      :show="openActiveStakeOptions && selectedStake !== null"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeOpenActiveStakeOptions"
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
          <div class="fixed inset-0 bg-black/25" />
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
                v-show="selectedStake !== null"
                class="card w-full max-w-[360px] p-[24px]"
              >
                <div class="text-left pb-[24px] border-b border-b-lightBorder dark:border-b-darkBorder">
                  <h1 class="card_title">
                    Inspect Stake
                  </h1>
                  <p class="card_subtitle whitespace-nowrap truncate">
                    Address: {{ selectedStake.address }}
                  </p>
                </div>
                <div class="flex flex-col items-start gap-[12px] py-[24px]">
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300]">Total Staked</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.amountStaked }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300]">Rewards</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.rewards }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300]">Available to Withdraw</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.availableToWithdraw }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                  <div class="py-[12px] w-full text-left border-b border-b-lightBorder dark:border-b-darkBorder">
                    <caption class="font-[500] whitespace-nowrap">
                      Withdrawls Info
                    </caption>
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300] whitespace-nowrap">Initiated Amount</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.WithdrawalInitiated }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300] whitespace-nowrap">Requested Amount</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.WithdrawalRequested }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                  <div class="flex w-full items-center justify-between">
                    <small class="font-[300] whitespace-nowrap">Fulfilled Amount</small>
                    <div class="flex items-center gap-[6px]">
                      <small class="max-w-[90px] truncate text-right">
                        {{ selectedStake.WithdrawalFulfilled }} 
                      </small>
                      <small>ETH</small>
                    </div>
                  </div>
                </div>

                <div class="pt-[12px] border-t border-t-lightBorder dark:border-t-darkBorder">
                  <div class="w-full text-left">
                    <div class="flex items-center justify-between">
                      <label for="amount_selector"><caption class="font-[500]">Amount</caption></label>
                      <caption
                        class="text-red font-[300] whitespace-nowrap" 
                        :class="errorMessage? 'opacity-100' : 'opacity-0'"
                        style="transition: all 0.6s ease-in;"
                      >
                        {{ errorMessage }}
                      </caption>
                    </div>
                    <div
                      ref="amount_selector"
                      class="input_container input_container_border"
                    > 
                      <div class="flex items-center gap-[8px] w-full">
                        <input
                          id="amount_input"
                          v-model="formatedAmountToWithdraw"
                          type="text"
                          pattern="\d+(\.\d{1,18})?"
                          placeholder="0.00"
                          class="outline-none bg-transparent w-full"
                          @input="handleInputAmountToWithdraw"
                        >
                      </div>
                      <div class="flex items-center gap-[4px]">
                        <small class="font-[500]">
                          ETH
                        </small>
                      </div>
                    </div>
                  </div>
                  <button
                    class="primary_btn w-full mt-[12px]"
                    @click="handleWithdrawAction"
                  >
                    <small class="font-[500]">
                      Withdraw
                    </small>
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style>
</style>