import { 
    onMounted,
    // onUnmounted,
    readonly,
    ref
} from "vue"
import { useStorage } from "@vueuse/core"
const userIsAnOperator = ref(undefined as undefined | boolean)
const showUserIsAnOperator = useStorage(
    "userIsAnOperator",
    userIsAnOperator
)

const registerOperatorModalIsOpen = ref(false)

const initializeComposable = ref(false)
  
export default function useOperatorStatus() {
    const toggleUserOperator = (value: boolean) => {
        showUserIsAnOperator.value = value
    }
      
    onMounted(() => {
        if (!initializeComposable.value) {
            initializeComposable.value = true
        }
    })
    
    // onUnmounted(() =>{
    //     // 
    // })

    return {
        showUserIsAnOperator: readonly(showUserIsAnOperator),
        registerOperatorModalIsOpen,
        toggleUserOperator
    }
}