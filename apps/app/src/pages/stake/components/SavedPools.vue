<script setup>
import { 
    XMarkIcon,
    DocumentDuplicateIcon
} from "@heroicons/vue/24/outline"
import { ref, watch } from "vue"
import useAvsPools from "@/composables/state/avsPools"
import StakeCard from "./StakeCard.vue"
import { 
    TabGroup,
    TabList,
    Tab,
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
} from "@headlessui/vue"
import useFormat from "@/composables/services/format"

const {
    avsPools,
    addPool,
    removeAVSFromPool,
    removePool
} = useAvsPools()

const openAddPool = ref(false)

const { convertString } = useFormat()

const closeAddPoolModal = () => {
    openAddPool.value = false
}
const  openAddPoolModal = () => {
    openAddPool.value = true
}

const stakeModal = ref(false)

const closeStakeModal = () => {
    stakeModal.value = false
}
const  openStakeModal = () => {
    stakeModal.value = true
}

const newPoolName = ref("")
const showErrorBorder = ref(false)

const handleCreatePool = () => {
    if (newPoolName.value !== "") {
        addPool(newPoolName.value)
        newPoolName.value = ""
        closeAddPoolModal()
    } else {
        showErrorBorder.value = true
    }
}

// const tabs = ref([])

const selectedTabIndex = ref(0)


const updatePercentage = (index, newValue) => {
    // Remove non-numeric characters except for the dot and handle empty input
    let valueStr = newValue.toString().replace(/[^0-9.]/g, "")
    if (valueStr === "") {
        avsPools.value[selectedTabIndex].avsPool[index].allocatedPercentage = 0.00
        return
    }

    avsPools.value[selectedTabIndex].avsPool[index].allocatedPercentage = valueStr

    // Optional: Adjust other sliders proportionally if needed
    // Code to adjust other sliders proportionally can be added here
}


const handleImageError = (event) => {
    event.target.src = "/casimir.svg"
}

</script>

<template>
  <div
    class="card w-full shadow p-[24px] "
    style="transition: all ease 0.3s;"
  >
    <div class="flex items-start justify-between gap-[12px]">
      <div class="text-left pb-[24px]">
        <h1 class="card_title">
          Selected Pools
        </h1>
        <p class="card_subtitle">
          View, adjust, and stake with your selected AVS pools
        </p>
      </div>

      <div class="flex items-center gap-[12px]">
        <button
          class="primary_btn"
          style="box-shadow: none;"
          @click="openStakeModal"
        >
          <small>
            Stake
          </small>
        </button>
        <button
          class="secondary_btn"
          style="box-shadow: none;"
          @click="openAddPoolModal"
        >
          <small>
            Create Pool
          </small>
        </button>
      </div>
    </div>
    <div class="flex justify-between items-center mb-[24px]">
      <TabGroup v-show="avsPools.length > 0">
        <TabList class="tabs_container">
          <Tab
            v-for="(pool, index) in avsPools"
            :key="index"
            class="outline-none"
            :class="index === selectedTabIndex? 'tab_item_selected' : 'tab_item'"
            @click="selectedTabIndex = index"
          >
            <small class="font-[600] opacity-80">{{ pool.poolName }}</small>
            <button @click="removePool(index), selectedTabIndex = 0">
              <XMarkIcon class="w-[12px] h-[12px]" />
            </button>
          </Tab>
        </TabList>
      </TabGroup>
    </div>
    <div
      v-if="avsPools.length > 0"
      class="w-full flex flex-wrap items-center gap-[24px]"
    >
      <div
        v-for="(avs, index) in avsPools[selectedTabIndex].avsPool "
        :key="index"
        class="p-[12px] bg-gray_4 dark:bg-gray_6 rounded-[6px] w-full min-w-[300px] max-w-[350px]"
      >
        <div class="text-left pb-[24px] flex items-start justify-between">
          <div class="flex items-start gap-[12px]">
            <div class="w-[32px] h-[32px] bg-gray_5 rounded-[999px] overflow-hidden">
              <img
                :src="avs.avs.metadataLogo"
                alt=""
                class="w-[90%] h-[90%] mx-auto my-auto"
                @error="handleImageError"
              >
            </div>
            <div>
              <h1 class="card_title">
                {{ avs.avs.metadataName }}
              </h1>
              <div
                class="tooltip_container flex items-center gap-[6px]"
                @click="copyTextToClipboard('address here')"
              >
                <p class="card_subtitle">
                  {{ convertString(avs.avs.address) }}
                </p>
                <div>
                  <DocumentDuplicateIcon class="w-[12px] h-[12px]" />
                </div>
                <div class="tooltip w-[200px]">
                  Service Manager Address
                </div>
              </div>
            </div>
          </div>
          <button @click="removeAVSFromPool(selectedTabIndex, avs)">
            <XMarkIcon class="w-[16px] h-[16px]" />
          </button>
        </div>
        <div class="text-[12px] tracking-normal mb-[12px] h-[50px] truncate">
          {{ avs.avs.metadataDescription }}
        </div>

        <div class="w-full">
          <div class="flex items-center w-full justify-between">
            <small class="font-[500]">Total Operators</small>
            <small class="font-[500] opacity-50">{{ avs.avs.totalOperators }}</small>
          </div>
          <div class="flex items-center w-full justify-between mt-[12px]">
            <small class="font-[500]">Total Stakers</small>
            <small class="font-[500] opacity-50">{{ avs.avs.totalStakers }}</small>
          </div>
          <div class="flex items-center w-full justify-between mt-[12px]">
            <small class="font-[500]">Total ETH Staked</small>
            <small class="font-[500] opacity-50">{{ avs.avs.tvl }} ETH</small>
          </div>
        </div>


        <div class="mt-[24px] mb-[6px]">
          <small>Allocated Stake Percentage</small>
        </div>
        <div class="mb-[12px] flex items-center gap-[12px] w-full">
          <div class="flex items-center gap-[3px]">
            <input
              v-model="avs.allocatedPercentage"
              type="text"
              :placeholder="avs.allocatedPercentage"
              class="w-[50px] text-left outline-none bg-transparent"
              @input="updatePercentage(index, $event.target.value)"
            >
            <small>%</small>
          </div>
          <div class="w-full">
            <input
              id="myRange"
              v-model="avs.allocatedPercentage"
              type="range"
              min="0"
              max="100"
              step="0.01"
              class="slider"
              @input="updatePercentage(index, $event.target.value)"
            >
          </div>
        </div>
      </div>
    </div>


    <div
      v-if="avsPools.length >= 0 && avsPools[selectedTabIndex]?.avsPool.length === 0"
      class="w-full flex flex-col items-center justify-center bg-gray_4 dark:bg-gray_2 p-[12px] rounded-[6px]"
    >
      <small class="font-[600] mb-[12px]">No AVS added</small>
      <caption>Add an AVS inorder to be able to allocate a stake percentage to it</caption>
    </div>
    <div
      v-if="avsPools.length === 0"
      class="w-full flex flex-col items-center justify-center bg-gray_4 dark:bg-gray_2 p-[12px] rounded-[6px]"
    >
      <small class="font-[600] mb-[12px]">No Pools Created</small>
      <caption>Create pool inorder to add AVS to the pool and allocate a staking percentage to it</caption>
    </div>

    <!-- Add Pool Modal -->
    <TransitionRoot
      appear
      :show="openAddPool"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeAddPoolModal"
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
                class="card w-full max-w-[360px] p-[24px] max-h-[500px] overflow-auto relative"
              >
                <div class="text-left pb-[24px]">
                  <h1 class="card_title">
                    Create AVS Pool
                  </h1>
                  <p class="card_subtitle">
                    Create an avs pool to customize your staking distrubution
                  </p>
                </div>

                <div class="w-full text-left">
                  <label for="amount_selector"><caption class="font-[500] whitespace-nowrap">Pool Name</caption></label>
                  <div
                    ref="amount_selector"
                    class="input_container"
                    :class="showErrorBorder? 'border border-red' : 'input_container_border'"
                  > 
                    <div class="flex items-center gap-[8px] w-full">
                      <input
                        id="amount_input"
                        v-model="newPoolName"
                        type="text"
                        pattern="\d+(\.\d{1,18})?"
                        placeholder="Pool Name"
                        class="outline-none bg-transparent w-full"
                      >
                    </div>
                  </div>
                </div>
                <button
                  class="primary_btn w-full mt-[24px]"
                  @click="handleCreatePool"
                >
                  <small>Create Pool</small>
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Stake Modal -->
    <TransitionRoot
      appear
      :show="stakeModal"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeStakeModal"
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
                class="card w-full max-w-[360px] p-[24px] max-h-[500px] overflow-auto relative"
              >
                <StakeCard />
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