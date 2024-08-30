<script setup>
import { ref } from "vue"
import { XMarkIcon, DocumentDuplicateIcon } from "@heroicons/vue/24/outline"
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from "@headlessui/vue"
import StakeCard from "./StakeCard.vue"
import useAvsStage from "@/composables/state/avsStage"
import useFormat from "@/composables/services/format"

const { convertString } = useFormat()
const { stage, adjustAllocation, removeAVSFromStage } = useAvsStage()

const stakeModal = ref(false)

const onAllocationChange = (index, newPercentage) => {
    adjustAllocation(index, newPercentage)
}

function handleImageError(event) {
    event.target.src = "/casimir.svg"
}
</script>

<template>
  <div
    class="card w-full shadow p-[24px]"
    style="transition: all ease 0.3s; overflow: visible"
  >
    <!-- Header, Title/Subtitle, Stake Button -->
    <div class="flex items-start justify-between gap-[12px]">
      <div class="text-left pb-[24px]">
        <h1 class="card_title">
          Stage
        </h1>
        <p class="card_subtitle">
          Add one or more AVSs to the stage and allocate a staking percentage to each
        </p>
      </div>

      <div class="flex items-center gap-[12px]">
        <button
          class="primary_btn"
          style="box-shadow: none;"
          @click="stakeModal = true"
        >
          <small>
            Stake
          </small>
        </button>
      </div>
    </div>

    <!-- The Stage -->
    <div
      v-if="stage.length > 0"
      class="w-full flex flex-wrap items-center gap-[24px]"
    >
      <div
        v-for="(avs, index) in stage"
        :key="index"
        class="p-[12px] bg-gray_4 dark:bg-gray_6 rounded-[6px] w-full min-w-[300px] max-w-[350px]"
      >
        <div class="text-left pb-[24px] flex items-start justify-between">
          <div class="flex items-start gap-[12px]">
            <div class="w-[32px] h-[32px] bg-gray_5 rounded-[999px] overflow-hidden">
              <img
                :src="avs.metadataLogo"
                alt=""
                class="w-full h-full mx-auto my-auto"
                @error="handleImageError"
              >
            </div>
            <div>
              <h1 class="card_title">
                {{ avs.metadataName }}
              </h1>
              <div
                class="tooltip_container flex items-center gap-[6px]"
                @click="copyTextToClipboard('address here')"
              >
                <p class="card_subtitle">
                  {{ convertString(avs.address) }}
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
          <button @click="removeAVSFromStage(avs)">
            <XMarkIcon class="w-[16px] h-[16px]" />
          </button>
        </div>
        <div class="text-[12px] tracking-normal mb-[12px] truncate">
          {{ avs.metadataDescription }}
        </div>

        <div class="w-full">
          <div class="flex items-center w-full justify-between">
            <small class="font-[500]">Total Operators</small>
            <small class="font-[500] opacity-50">{{ avs.totalOperators }}</small>
          </div>
          <div class="flex items-center w-full justify-between mt-[12px]">
            <small class="font-[500]">Total Stakers</small>
            <small class="font-[500] opacity-50">{{ avs.totalStakers }}</small>
          </div>
          <div class="flex items-center w-full justify-between mt-[12px]">
            <small class="font-[500]">Total ETH Staked</small>
            <small class="font-[500] opacity-50">{{ avs.tvl }} ETH</small>
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
              @input="onAllocationChange(index, $event.target.value)"
            >
            <span class="text-[10.22px]">%</span>
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
              @input="onAllocationChange(index, avs.allocatedPercentage)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Stake Modal -->
    <TransitionRoot
      appear
      :show="stakeModal"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-10"
        @close="stakeModal = false"
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