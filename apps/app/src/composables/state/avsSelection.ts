import { 
    onMounted,
    onUnmounted,
    ref
} from "vue"


const initializeComposable = ref(false)

// TODO: @ccali11 - create AVS type here
interface AVS {
    address: string,
    name: string,
    description: string,
    image: string
}
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