<script setup>
import { GlobeAltIcon, DocumentDuplicateIcon } from "@heroicons/vue/24/outline"
import useAVS from "@/composables/avs"
import useAvsStage from "@/composables/avsStage"
import useFormat from "@/composables/format"

const { copyTextToClipboard, formatAddress } = useFormat()
const { addAVSToStage } = useAvsStage()
const { selectedAVS } = useAVS()

// eslint-disable-next-line no-undef
const props = defineProps({
    closeStakeWithAVSModal: {
        type: Function,
        required: true,
    },
})
</script>

<template>
    <div class="w-full flex flex-col items-start justify-between gap-[24px] relative">
        <!-- Header -->
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

        <!-- AVS Description -->
        <div class="text-[12px] tracking-normal text-left">
            {{ selectedAVS.metadataDescription }}
        </div>

        <!-- AVS Details -->
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
                    @click="copyTextToClipboard(selectedAVS.address)"
                >
                    <p class="card_subtitle">
                        {{ formatAddress(selectedAVS.address) }}
                    </p>
                    <div>
                        <DocumentDuplicateIcon class="w-[12px] h-[12px]" />
                    </div>
                    <div class="relative">
                        <div class="tooltip absolute right-0 mt-4 w-[200px] bg-gray-700 text-white p-2 rounded shadow-lg">
                            Service Manager Address
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add To Stage Button -->
        <button
            class="primary_btn w-full mt-[24px]"
            @click="addAVSToStage(selectedAVS), props.closeStakeWithAVSModal()"
        >
            <small>Add To Stage</small>
        </button>
    </div>
</template>

<style>
</style>