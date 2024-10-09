import useToasts from "@/composables/toasts"
import { formatUnits } from "viem"

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
                            subtitle: "Copied Address " + formatAddress(text),
                            timed: true,
                            loading: false,
                            iconUrl: ""
                        }
                    )
                }, 1000)
            })
            .catch(() => {
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

    function formatAddress(inputString: string) {
        if (inputString.length && inputString.length <= 4) {
            return inputString
        }
      
        const start = inputString.substring(0, 5)
        const end = inputString.substring(inputString.length - 4)
        const middle = ".".repeat(3)
      
        return start + middle + end
    }

    function formatEthBalance(balanceInWei: bigint) {
        const balanceInEth = parseFloat(formatUnits(balanceInWei, 18))
    
        const trimDecimals = (value: number, decimals: number) => {
            const factor = Math.pow(10, decimals)
            return Math.floor(value * factor) / factor
        }
    
        if (balanceInEth < 0.001) {
            return trimDecimals(balanceInEth, 6).toFixed(6)
        } else if (balanceInEth < 1) {
            return trimDecimals(balanceInEth, 4).toFixed(4)
        } else if (balanceInEth < 1000) {
            return trimDecimals(balanceInEth, 3).toFixed(3)
        } else {
            return trimDecimals(balanceInEth, 2).toFixed(2)
        }
    }    

    function handleImageError(event: Event) {
        if (event.target) {
            (event.target as HTMLImageElement).src = "/casimir.svg"
        }
    }

    function trimAndLowercaseAddress(address: string) {
        return address.trim().toLowerCase()
    }

    return {
        copyTextToClipboard,
        formatAddress,
        formatEthBalance,
        handleImageError,
        trimAndLowercaseAddress,
    }
}