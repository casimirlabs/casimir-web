<script setup>
import { ref } from "vue"
import { 
    TabGroup,
    TabList,
    Tab,
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/vue"
import { 
    CheckIcon,
    GlobeAltIcon,
    DocumentDuplicateIcon,
    ChevronUpDownIcon
} from "@heroicons/vue/24/outline"

import useToasts from "@/composables/state/toasts"
import useFormat from "@/composables/services/format"
import useAvsPools from "@/composables/state/avsPools"

// eslint-disable-next-line no-undef
const props = defineProps({
    closeStakeWithAVSModal: {
        type: Function,
        required: true,
    },
})

const tabs = ref([
    "Add to Pool",
    "Creat New Pool"
])

const selectedTabIndex = ref(0)

const {
    avsPools,
    addPoolWithAVS,
    addAVSToPool
} = useAvsPools()


const {
    addToast,
} = useToasts()

const { 
    convertString,
} = useFormat()

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            setTimeout(() => {
                addToast(
                    {
                        id: "copy_address_" + text,
                        type: "success",
                        title: "Address Copied",
                        subtitle: "Copied Address " + convertString(text),
                        timed: true,
                        loading: false
                    }
                )
            }, 1000)
        })
        .catch(err => {
            setTimeout(() => {
                addToast(
                    {
                        id: "copy_address_" + text,
                        type: "failed",
                        title: "Failed to Copy Address",
                        subtitle: "Something went wrong, please try again later",
                        timed: true,
                        loading: false
                    }
                )
            }, 1000)
        })
}

const newPoolName = ref("")
const showErrorBorder = ref(false)
const selectedPool = ref(null)

const handleCreatePool = () => {
    if (newPoolName.value !== "") {
        props.closeStakeWithAVSModal()
        addPoolWithAVS(newPoolName, { avName: "AVS Name here", allocatedPercentage: 0.00 })
    } else {
        showErrorBorder.value = true
    }
}

const handleAddToPool = () => {
    const selectedPoolIndex = avsPools.value.findIndex(item => item.poolName === selectedPool.value.poolName)
    if (selectedPoolIndex !== -1) {
        props.closeStakeWithAVSModal()
        addAVSToPool(selectedPoolIndex, { avName: "AVS Name here", allocatedPercentage: 0.00 })
    } else {
        showErrorBorder.value = true
    }
}





</script>

<template>
  <div class="w-full flex flex-col items-start justify-between gap-[24px] relative">
    <div class="flex items-center justify-between w-full">
      <div class="tooltip_container whitespace-nowrap">
        <div
          class="w-[16px] h-[16px] bg-green rounded-[999px] blur-[6px]"
        />
        <div 
          class="w-[12px] h-[12px] bg-green rounded-[999px] absolute top-[2px] left-[2px]"
        />
        <div class="tooltip whitespace-nowrap w-[200px]">
          Status here
        </div>
      </div>
      <div class="flex items-center gap-[12px]">
        <a
          href=""
          target="_blank"
          class="outline-none"
        >
          <div class="w-[12px] h-[12px]">
            <img
              src="/x-logo.png"
              alt=""
              class="w-full h-full"
            >
          </div>
        </a>
        <a
          href=""
          target="_blank"
          class="text-blue-500 outline-none"
        >
          <GlobeAltIcon class="w-[16px] h-[16px]" />
        </a>
      </div>
    </div>

    <div class="flex items-center gap-[12px]">
      <div class="w-[50px] h-[50px] bg-gray-300 rounded-[999px] overflow-hidden">
        <img
          src=""
          class="w-full h-full"
          alt=""
        > 
      </div>
      <div>
        <h1 class="card_title">
          AVS Name Here
        </h1>
        <div
          class="tooltip_container flex items-center gap-[6px]"
          @click="copyTextToClipboard('address here')"
        >
          <p class="card_subtitle">
            asd...123 
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

    <div class="text-[12px] tracking-normal">
      description here
    </div>

    <div class="w-full">
      <div class="flex items-center w-full justify-between">
        <small class="font-[500]">Total Operators</small>
        <small class="font-[500]"># here</small>
      </div>
      <div class="flex items-center w-full justify-between mt-[12px]">
        <small class="font-[500]">Total Stakers</small>
        <small class="font-[500]"># here</small>
      </div>
      <div class="flex items-center w-full justify-between mt-[12px]">
        <small class="font-[500]">Total ETH Staked</small>
        <small class="font-[500]"># here ETH</small>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <TabGroup>
        <TabList class="tabs_container">
          <Tab
            v-for="(tab, index) in tabs"
            :key="index"
            class="outline-none"
            :class="index === selectedTabIndex? 'tab_item_selected' : 'tab_item'"
            @click="selectedTabIndex = index"
          >
            <small class="font-[600] opacity-80">{{ tab }}</small>
          </Tab>
        </TabList>
      </TabGroup>
    </div>

    <div
      v-if="selectedTabIndex === 0"
      class="w-full"
    >
      <div class="w-full text-left">
        <label for="amount_selector"><caption class="font-[500] whitespace-nowrap">Select Pool</caption></label>
        
        <Listbox v-model="selectedPool">
          <div class="relative mt-1">
            <ListboxButton
              class="relative w-full input_container"
              :class="showErrorBorder? 'border border-red' : 'input_container_border'"
            >
              <small class="block truncate">{{ selectedPool? selectedPool.poolName : 'Select Pool' }}</small>
              <span
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <ChevronUpDownIcon
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions
                class="absolute bottom-0 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-darkBg py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                <div
                  v-if="avsPools.length === 0"
                  class="px-[12px]"
                >
                  <small>No pools exists</small>
                </div>
                <div v-else>
                  <ListboxOption
                    v-for="avs in avsPools"
                    v-slot="{ active, selected }"
                    :key="avs.poolName"
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
                        :class="[
                          selected ? 'font-medium' : 'font-normal',
                          'block truncate',
                        ]"
                      >{{ avs.poolName }}</span>
                      <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-black dark:text-white"
                      >
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
      <button
        class="primary_btn w-full mt-[24px]"
        @click="handleAddToPool"
      >
        <small>Add to Pool</small>
      </button>
    </div>

    <div
      v-else-if="selectedTabIndex === 1"
      class="w-full"
    >
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
              class="outline-none bg-transparent w-full text-[14.22px]"
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
    </div>
  </div>
</template>

<style>
</style>