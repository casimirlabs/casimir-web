<script setup>
import { ref, computed } from "vue"
import { 
    InformationCircleIcon,
    PlusIcon,
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon
} from "@heroicons/vue/24/outline"
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from "@headlessui/vue"
import { useStorage } from "@vueuse/core"
import RegisterNode from "./RegisterNode.vue"
import useOperators from "@/composables/services/operator.ts"
import useOperatorStatus from "@/composables/state/operatorStatus.ts"
import useFormat from "@/composables/services/format"
import Loading from "@/components/elements/Loading.vue"

const { registerOperatorModalIsOpen } = useOperatorStatus()
const { registeredBaseOperators, loadingRegisteredOperators } = useOperators()

const closeRegisterNodeModal = () => {
    registerOperatorModalIsOpen.value = false
}
const  openRegisterNodeModal = () => {
    registerOperatorModalIsOpen.value = true
}

const { convertString } = useFormat()

const nodeOptions = ref(false)
const selectedNode = ref(null)
const closeNodeOptions = () => {
    nodeOptions.value = false
}
const  openNodeOptions = () => {
    nodeOptions.value = true
}

const columns = [
    { title: "ID", show: ref(true), value: "id" }, 
    { title: "Address", show: ref(true), value: "ownerAddress" }, 
    { title: "Collateral", show: ref(true), value: "collateral" }, 
    { title: "Active Validators", show: ref(true), value: "poolCount" }, 
    { title: "Node URL", show: ref(true), value: "url" }, 
]
const tableHeaders = ref(columns)
useStorage("chosenActiveNodesTableHeaders", tableHeaders.value)

const currentPage = ref(1)
const itemsPerPage = ref(9)
const pagesAvailable = computed(() => {
    return Math.ceil(registeredBaseOperators?.value?.length / itemsPerPage.value)
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


const filteredActiveNodes = computed(() => {
    if (registeredBaseOperators.value.length >= itemsPerPage.value) {
        return registeredBaseOperators.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value)
    } else {
        return registeredBaseOperators.value
    }
})
</script>

<template>
  <div class="w-full h-full card shadow p-[24px] flex flex-col items-start justify-between gap-[24px] relative">
    <div class="w-full flex items-center justify-between">
      <div class="flex items-center gap-[8px]">
        <h1 class="card_title">
          Active Nodes
        </h1>
        <div class="mb-[3px] tooltip_container">
          <InformationCircleIcon class="w-[20px] h-[20px]" />
          <div class="tooltip w-[200px]">
            View your current active SSV nodes on Casimir. Click node for node setting options.
          </div>
        </div>
      </div>
        
      <button
        class="primary_btn"
        @click="openRegisterNodeModal()"
      >
        <PlusIcon class="w-[14px] h-[14px]" />
        <small class="font-[500]">Node</small>
      </button>
    </div>

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
            v-if="!loadingRegisteredOperators"
            class="w-full"
          >
            <tr
              v-for="(node, index) in filteredActiveNodes"
                
              :key="index"
              class="hover:bg-gray_4 dark:hover:bg-gray_6 cursor-pointer whitespace-nowrap"
              @click="openNodeOptions(), selectedNode = node"
            >
              <td
                v-for="(item, tableIndex) in tableHeaders"
                v-show="item.show"
                :key="tableIndex"
                class="border-b py-[8px] border-b-lightBorder dark:border-b-darkBorder"
              >
                <div 
                  v-if="item.value === 'ownerAddress'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  {{ convertString(node[item.value] ) }}
                </div>

                <div 
                  v-else-if="item.value === 'collateral'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  {{ node[item.value] }} ETH
                </div>

                <div 
                  v-else-if="item.value === 'poolCount'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  {{ node[item.value] }} Validators
                </div>


                <div 
                  v-else-if="item.value === 'url'"
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  {{ node[item.value]? node[item.value] : 'Not Available' }}
                </div>
                <div
                  v-else 
                  class="px-[8px] flex items-center gap-[12px]"
                >
                  {{ node[item.value] }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="loadingRegisteredOperators"
      class="w-full h-full absolute top-0 left-0 opacity-45 flex items-center justify-center"
    >
      <div class="w-[100px] h-[100px]">
        <Loading :show-text="false" />
      </div>
    </div>

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


    <!-- Register Node -->
    <TransitionRoot
      appear
      :show="registerOperatorModalIsOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeRegisterNodeModal"
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
                <RegisterNode />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Node Options -->
    <TransitionRoot
      appear
      :show="nodeOptions"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="closeNodeOptions"
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
                <div>
                  Node options
                  <!-- TODO: add node info and buttons for deactivations and withdraws -->
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