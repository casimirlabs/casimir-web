import useToasts from "@/composables/toasts"

const { addToast } = useToasts()

export default function useFormat() {
    function copyTextToClipboard(text: string) {
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
                            loading: false,
                            iconUrl: ""
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
                            loading: false,
                            iconUrl: ""
                        }
                    )
                }, 1000)
            })
    }

    function convertString(inputString: string) {
        if (inputString.length && inputString.length <= 3) {
            return inputString
        }
      
        const start = inputString.substring(0, 3)
        const end = inputString.substring(inputString.length - 3)
        const middle = ".".repeat(3)
      
        return start + middle + end
    }

    function trimAndLowercaseAddress(address: string) {
        return address.trim().toLowerCase()
    }

    return {
        copyTextToClipboard,
        convertString, 
        trimAndLowercaseAddress,
    }
}