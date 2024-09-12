<script setup>
import { ref } from "vue"
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from "@headlessui/vue"
import AVSCard from "@/pages/dashboard/components/AVSCard.vue"
import useAVS from "@/composables/avs"
import useFormat from "@/composables/format"
import useStaking from "@/composables/staking"

const columns = [
    { title: "AVS", show: ref(true), value: "metadataName" },
    { title: "Logo", show: ref(false), value: "metadataLogo" },
]
const { selectedAVS } = useAVS()
const { selectStakeOption, stakeOptions } = useStaking()
const { handleImageError } = useFormat()
const tableHeaders = ref(columns)
const stakeWithAVSModal = ref(false)

function closeStakeWithAVSModal() {
    stakeWithAVSModal.value = false
}
function openStakeWithAVSModal() {
    stakeWithAVSModal.value = true
}
</script>

<template>
    <div class="card w-full h-full shadow p-[24px] flex flex-col items-start justify-between gap-[24px]">
        <!-- Title and Subtitle -->
        <div class="w-full flex items-center gap-[8px] min-w-[210px]">
            <div>
                <h1 class="card_title">
                    AVS
                </h1>

                <p class="card_subtitle">
                    Browse and select an AVS to begin restaking
                </p>
            </div>
        </div>

        <!-- Table -->
        <div class="w-full h-full">
            <div class="w-full border border-lightBorder dark:border-darkBorder rounded-[6px] overflow-x-auto overflow-y-scroll">
                <table class="w-full overflow-x-auto">
                    <tbody class="w-full overflow-scroll">
                        <tr
                            v-for="option in stakeOptions"
                            :key="option.id"
                            class="hover:bg-gray_4 dark:hover:bg-gray_6 cursor-pointer whitespace-nowrap"
                            @click="openStakeWithAVSModal(), selectStakeOption(option.id)"
                        >
                            <td
                                v-for="(item, index) in tableHeaders"
                                v-show="item.show"
                                :key="index"
                                class="border-b py-[8px] border-b-lightBorder dark:border-b-darkBorder"
                            >
                                <div
                                    v-if="item.value === 'metadataName'"
                                    class="px-[8px] flex items-center gap-[12px]"
                                >
                                    <div class="w-[20px] h-[20px] rounded-[999px]">
                                        <img
                                            :src="option.avs?.metadataLogo"
                                            :alt="`AVS Logo: ${option.avs?.metadataLogo}`"
                                            class="w-full h-full"
                                            @error="handleImageError"
                                        >
                                    </div>
                                    <small class="w-[150px] truncate">{{ option.avs?.metadataName }}</small>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- AVS Card & Staking Modal-->
        <TransitionRoot
            appear
            :show="stakeWithAVSModal && selectedAVS !== null"
            as="template"
        >
            <Dialog
                as="div"
                class="relative z-10"
                @close="closeStakeWithAVSModal"
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
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
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
                                v-show="selectedAVS !== null"
                                class="card w-full min-w-[320px] max-w-[450px] p-[24px] mx-auto"
                            >
                                <AVSCard
                                    :close-stake-with-a-v-s-modal="closeStakeWithAVSModal"
                                />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>