<script setup>
import { ref } from "vue"
import { GlobeAltIcon, DocumentDuplicateIcon } from "@heroicons/vue/24/outline"
import useAVSSelection from "@/composables/state/avsSelection"
import useAvsStage from "@/composables/state/avsStage"
import useFormat from "@/composables/services/format"
import useToasts from "@/composables/state/toasts"

const { addToast } = useToasts()
const { convertString } = useFormat()

const selectedTabIndex = ref(0)
const { addAVSToStage } = useAvsStage()
const { selectedAVS } = useAVSSelection()

// eslint-disable-next-line no-undef
const props = defineProps({
    closeStakeWithAVSModal: {
        type: Function,
        required: true,
    },
})


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
</script>

<template>
  <div class="w-full flex flex-col items-start justify-between gap-[24px] relative">
    <div class="flex items-center justify-between w-full">
      <div class="tooltip_container whitespace-nowrap">
        <div class="flex items-center gap-[12px]">
          <div class="w-[50px] h-[50px] bg-transparent rounded-[999px] overflow-hidden">
            <img
              :src="selectedAVS.metadataLogo"
              class="w-full h-full"
              alt=""
            > 
          </div>
          <div>
            <h1 class="card_title">
              {{ selectedAVS.metadataName }}
            </h1>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-[12px]">
        <a
          :href="selectedAVS.metadataX"
          target="_blank"
          class="outline-none  p-[5px]"
        >
          <small class="font-[600] text-[10.22px]">Twitter</small>
        </a>
        <a
          :href="selectedAVS.metadataWebsite"
          target="_blank"
          class="text-blue-500 dark:text-blue-200 outline-none"
        >
          <GlobeAltIcon class="w-[16px] h-[16px]" />
        </a>
      </div>
    </div>

    <!-- {{ selectedAVS }} -->

    <div class="text-[12px] tracking-normal text-left">
      {{ selectedAVS.metadataDescription }}
    </div>

    <div class="w-full">
      <div class="flex items-center w-full justify-between">
        <small class="font-[500]">Total Operators</small>
        <small class="font-[500]">{{ selectedAVS.totalOperators }}</small>
      </div>
      <div class="flex items-center w-full justify-between mt-[12px]">
        <small class="font-[500]">Total Stakers</small>
        <small class="font-[500]">{{ selectedAVS.totalStakers }}</small>
      </div>
      <div class="flex items-center w-full justify-between mt-[12px]">
        <small class="font-[500]">Total ETH Staked</small>
        <small class="font-[500]">{{ selectedAVS.tvl }} ETH</small>
      </div>
      <div class="flex items-center w-full justify-between mt-[12px]">
        <small class="font-[500]">Address</small>
        <div
          class="tooltip_container flex items-center gap-[6px]"
          @click="copyTextToClipboard('address here')"
        >
          <p class="card_subtitle">
            {{ convertString(selectedAVS.address) }}
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

    <div
      v-if="selectedTabIndex === 0"
      class="w-full"
    >
      <button
        class="primary_btn w-full mt-[24px]"
        @click="addAVSToStage(selectedAVS), props.closeStakeWithAVSModal()"
      >
        <small>Add To Stage</small>
      </button>
    </div>
  </div>
</template>

<style>
</style>