import { readonly, ref } from "vue"

interface Toast {
  id: string; // random for removing purposes
  type: string; // failed || success || loading || info
  iconUrl: string;
  title: string;
  subtitle: string;
  timed: boolean;
  loading: boolean;
}

const toasts = ref([] as Toast[])

export default function useToasts() {
    const addToast = (t: Toast) => {
        toasts.value.push(t)
        if (t.timed) {
            setTimeout(() => {
                const index = toasts.value.indexOf(t)
                if (index !== -1) {
                    toasts.value.splice(index, 1)
                }
            }, 3100)
        }
    }
    
    const findToastById = (toastId: string) => {
        return toasts.value.find((toast) => toast.id === toastId)
    }

    function generateRandomToastId(): string {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        let result = ""
        for (let i = 0; i < 16; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }

    const updateToast = (t: Toast) => {
        const toast = findToastById(t.id)
        if (toast) {
            Object.assign(toast, t)
        }
    }

    const removeToast = (toastId: string) => {
        const updatedToasts = toasts.value.filter((toast) => toast.id !== toastId)
        toasts.value = updatedToasts
    }

    return {
        toasts: readonly(toasts),
        addToast,
        generateRandomToastId,
        removeToast,
        updateToast
    }
}
