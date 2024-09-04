import { AVS } from "@casimir/types"
import { 
    onMounted,
    onUnmounted,
    ref
} from "vue"


const initializeComposable = ref(false)

const selectedAVS = ref<AVS>()
  
export default function useAVSSelection() {
    const selectAVS = (value: any) => {
        selectedAVS.value = value
    }
      
    onMounted(() => {
        // 
    })
    
    onUnmounted(() =>{
        // 
    })

    return {
        selectedAVS: selectedAVS,
        selectAVS
    }
}