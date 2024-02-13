import { computed, onMounted, onUnmounted, readonly, ref, watch } from "vue"
import { useStorage } from "@vueuse/core"
import { CasimirManager } from "@casimir/ethereum/build/@types"
import { ProviderString, StakeDetails } from "@casimir/types"
import { ethers } from "ethers"
import useContracts from "@/composables/services/contracts"
import useEthers from "@/composables/services/ethers"
import useLedger from "@/composables/services/ledger"
import useToasts from "@/composables/state/toasts"
import useTrezor from "@/composables/services/trezor"
import useUser from "@/composables/services/user"
import useWallets from "@/composables/services/wallets"
import useWalletConnectV2 from "@/composables/services/walletConnectV2"

const { getBaseManager, getEigenManager, contractsAreInitialized } = useContracts()
const { browserProvidersList, getEthersBrowserSigner } = useEthers()
const { getEthersLedgerSigner } = useLedger()
const { getEthersTrezorSigner } = useTrezor()
const {
    addToast,
    updateToast,
    removeToast
} = useToasts()
const { user } = useUser()
const { detectActiveNetwork } = useWallets()
const { getWalletConnectSignerV2 } = useWalletConnectV2()

let baseManager: CasimirManager
let eigenManager: CasimirManager

const initializeComposable = ref(false)
const stakingWalletAddress = ref(null as null | string)
const stakingAmount = ref(null as null | number)
const eigenLayerSelection = ref(false as boolean)
const selectedWalletProvider = computed(() => {
    const index = user?.value?.accounts?.findIndex(item => {item.address == stakingWalletAddress.value}) as number
    if (index > -1) {
        return user?.value?.accounts[index].walletProvider
    } else {
        return null
    }
})

const withdrawAmount = ref(null as null | number)
const acceptTerms = ref(false)
  
export default function useStakingState() {

    watch(contractsAreInitialized, async () => {
        if (contractsAreInitialized.value) {
            baseManager = getBaseManager()
            eigenManager = getEigenManager()
            await getUserStakeDetails()
        }
    })
      
    onMounted(async () => {
        if (!initializeComposable.value) {
            stakingWalletAddress.value = null
            stakingAmount.value = null
            eigenLayerSelection.value = false
            useStorage("acceptTerms", acceptTerms)
            if (!contractsAreInitialized.value) return
            baseManager = getBaseManager()
            eigenManager = getEigenManager()
            await getUserStakeDetails()
        }
    })
    
    onUnmounted(() =>{
        stakingWalletAddress.value = null
        stakingAmount.value = null
        eigenLayerSelection.value = false
    })

    const selectWallet = (address: string) => {
        stakingWalletAddress.value = address
    }

    const setAmountToStake = (amount: number) => {
        stakingAmount.value = amount
    }

    const toggleEigenlayerSelection = () => {
        eigenLayerSelection.value = !eigenLayerSelection.value
    }

    const toggleTerms = () => {
        acceptTerms.value = !acceptTerms.value
    }

    const setWithdrawAmount = (amount: number) => {
        withdrawAmount.value = amount
    }

    const getRandomToastId = (length: number) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        let result = ""
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }

    async function deposit({ amount, walletProvider, type, pathIndex }: { amount: string, walletProvider: ProviderString, type: "default" | "eigen", pathIndex: number | undefined}) {
        let toastContent = {
            id: getRandomToastId(16),
            type: "loading",
            iconUrl: "",
            title: "Submitting Stake",
            subtitle: "Processing stake request",
            timed: false,
            loading: true
        }
        addToast(toastContent)

        try {
            // TODO: @ccali11 Make sure we're getting the right network here.
            const activeNetwork = await detectActiveNetwork(walletProvider)
            console.log("activeNetwork :>> ", activeNetwork)
            // if (activeNetwork !== 5) {
            //     await switchEthersNetwork(walletProvider, "0x5")
            //     return window.location.reload()
            // }

            let signer
            if (browserProvidersList.includes(walletProvider)) {
                signer = getEthersBrowserSigner(walletProvider)
            } else if (walletProvider === "WalletConnect") {
                signer = await getWalletConnectSignerV2()
            } else if (walletProvider === "Ledger") {
                signer = getEthersLedgerSigner(pathIndex)
            } else if (walletProvider === "Trezor") {
                signer = getEthersTrezorSigner()
            } else {
                throw new Error(`Invalid wallet provider: ${walletProvider}`)
            }
            const manager = type === "default" ? baseManager : eigenManager
            const managerSigner = (manager as CasimirManager).connect(signer as ethers.Signer)
            const fees = await getDepositFees()
            const depositAmount = parseFloat(amount) * ((100 + fees) / 100)
            const value = ethers.utils.parseEther(depositAmount.toString())
            toastContent ={
                id: toastContent.id,
                type: "loading",
                iconUrl: "",
                title: "Waiting on Confirmation",
                subtitle: "Waiting for user to confirm stake action",
                timed: false,
                loading: true
            }
            updateToast(toastContent)
            const result = await managerSigner.depositStake({ value, type: 2 })
            const confirmation = await result.wait(1)
            if (confirmation) console.log("toast!")
            toastContent ={
                id: toastContent.id,
                type: "success",
                iconUrl: "",
                title: "Stake Confirmed",
                subtitle: "Stake is confirmed and is sitting in a pool",
                timed: true,
                loading: false
            }
            updateToast(toastContent)
            setTimeout(() => {
                removeToast(toastContent.id)
            }, 3000)
            return confirmation
        } catch (err: any) {
            console.error(`Error in deposit function: ${JSON.stringify(err)}`)
            // Add error to local storage
            localStorage.setItem("stakeWithdrawError", err)
            if (err.message.includes("denied by the user")) {
                toastContent ={
                    id: toastContent.id,
                    type: "failed",
                    iconUrl: "",
                    title: "Denied by User",
                    subtitle: "Transaction denied by the user",
                    timed: true,
                    loading: false
                }
                updateToast(toastContent)

                setTimeout(() => {
                    removeToast(toastContent.id)
                }, 3000)
            } else {
                toastContent ={
                    id: toastContent.id,
                    type: "failed",
                    iconUrl: "",
                    title: "Something Went Wrong",
                    subtitle: "Please try again later",
                    timed: true,
                    loading: false
                }
                updateToast(toastContent)

                setTimeout(() => {
                    removeToast(toastContent.id)
                }, 3000)
            }
            return false
        }
    }

    // TODO: hande stake and withdraw functions
    async function handleStake() {
        await deposit({
            amount: stakingAmount?.value?.toString() as string,
            walletProvider: selectedWalletProvider.value as ProviderString,
            type: eigenLayerSelection.value? "eigen" : "default",
            pathIndex: undefined
        })

        // if (browserProvidersList.includes(selectedWalletAddress.value as string)) {
        //     const activeAddress = await detectActiveWalletAddress(selectedStakingProvider.value)
        //     if (activeAddress !== selectedWalletAddress.value) {
        //         formattedAmountToStakeOrWithdraw.value = 0
        //         stakeButtonText.value = "Stake"
        //         return alert(`The account you selected is not the same as the one that is active in your ${selectedStakingProvider.value} wallet. Please open your ${selectedStakingProvider.value} browser extension select the account you want to use to stake.`)
        //     }
        // } else {
        //     pathIndex = getPathIndex(selectedStakingProvider.value, selectedWalletAddress.value as string)
        // }
        // const depositPayload = {
        //     amount: formattedAmountToStakeOrWithdraw.value.toString(),
        //     walletProvider: selectedStakingProvider.value,
        //     type: stakeType.value,
        //     pathIndex: pathIndex !== undefined ? pathIndex : undefined
        // }
        // const result = await deposit(depositPayload)
    }

    async function handleWithdraw() {
        let toastContent ={
            id: getRandomToastId(16),
            type: "loading",
            iconUrl: "",
            title: "Withdrawing Stake",
            subtitle: "Processing stake withdraw request",
            timed: false,
            loading: true
        }
        addToast(toastContent)

        setTimeout(() => {
            toastContent ={
                id: toastContent.id,
                type: "loading",
                iconUrl: "",
                title: "Confirming Withdraw",
                subtitle: "Confirming stake withdraw from pool",
                timed: false,
                loading: true
            }
            updateToast(toastContent)

            setTimeout(() => {
                toastContent ={
                    id: toastContent.id,
                    type: "success",
                    iconUrl: "",
                    title: "Stake Withdraw Complete",
                    subtitle: "Stake withdraw is finalized and  no errors",
                    timed: false,
                    loading: false
                }
                updateToast(toastContent)
                setTimeout(() => {
                    removeToast(toastContent.id)
                }, 3000)
            }, 3000)
        }, 3000)

        // Add toast accordingly
        // handle withdraw here
        // submit withdraw
    }

    async function getDepositFees(): Promise<number> {
        try {
            // TODO: Fix this bug
            // const fees = await (manager as CasimirManager).FEE_PERCENT()
            const fees = 5
            const feesRounded = Math.round(fees * 100) / 100
            return feesRounded
        } catch (err: any) {
            console.error(`There was an error in getDepositFees function: ${JSON.stringify(err)}`)
            throw new Error(err)
        }
    }

    async function getUserStakeDetails() {
        const result: Array<StakeDetails> = []
        const addresses = user.value?.accounts.map((account) => account.address) as Array<string>

        async function getUserStakeAndWithdrawable(manager: CasimirManager, address: string) {
            const userStake = await (manager as CasimirManager).getUserStake(address)
            const userStakeNumber = parseFloat(ethers.utils.formatEther(userStake))
            const availableToWithdraw = await (manager as CasimirManager).getWithdrawableBalance()
            const availableToWithdrawNumber = parseFloat(ethers.utils.formatEther(availableToWithdraw))
    
            return { userStakeNumber, availableToWithdrawNumber }
        }
    
        const promises = addresses.map(async (address) => {
            const [baseManagerData, /* eigenManagerData */] = await Promise.all([
                getUserStakeAndWithdrawable(baseManager, address),
                // getUserStakeAndWithdrawable(eigenManager, address),
            ])
    
            if (baseManagerData.userStakeNumber > 0) {
                result.push({
                    operatorType: "Default",
                    address,
                    amountStaked: baseManagerData.userStakeNumber,
                    availableToWithdraw: baseManagerData.availableToWithdrawNumber,
                })
            }
    
            // if (eigenManagerData.userStakeNumber > 0) {
            //     result.push({
            //         operatorType: "Eigen",
            //         address,
            //         amountStaked: eigenManagerData.userStakeNumber,
            //         availableToWithdraw: eigenManagerData.availableToWithdrawNumber,
            //     })
            // }
        })
    
        await Promise.all(promises)
        userStakeDetails.value = result
    }

    return {
        stakingWalletAddress: readonly(stakingWalletAddress),
        stakingAmount: readonly(stakingAmount),
        eigenLayerSelection: readonly(eigenLayerSelection),
        acceptTerms: readonly(acceptTerms),
        withdrawAmount: readonly(withdrawAmount),
        selectWallet,
        setAmountToStake,
        toggleEigenlayerSelection,
        toggleTerms,
        handleStake,
        setWithdrawAmount,
        handleWithdraw
    }
}