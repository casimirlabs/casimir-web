import { readonly, ref, watch } from "vue"
import { ethers } from "ethers"
import { ProviderString } from "@casimir/types"
import useContracts from "@/composables/contracts"
import useEthers from "@/composables/ethers"
import useLedger from "@/composables/ledger"
import useTrezor from "@/composables/trezor"
import useWallets from "@/composables/wallets"
import useWalletConnectV2 from "./walletConnectV2"
import { CasimirManager } from "@casimir/ethereum/build/@types"

const { getBaseManager, getEigenManager, contractsAreInitialized } = useContracts()
const { browserProvidersList, getEthersBrowserSigner } = useEthers()
const { getEthersLedgerSigner } = useLedger()
const { getEthersTrezorSigner } = useTrezor()
const { detectActiveNetwork, switchEthersNetwork } = useWallets()
const { getWalletConnectSignerV2 } = useWalletConnectV2()

const stakingComposableInitialized = ref(false)
const awaitingStakeOrWithdrawConfirmation = ref(false)

let baseManager: CasimirManager
let eigenManager: CasimirManager

export default function useStaking() {

    watch(contractsAreInitialized, async () => {
        if (contractsAreInitialized.value) {
            await initializeStakingComposable()
        }
    })

    async function initializeStakingComposable() {
        baseManager = getBaseManager()
        eigenManager = getEigenManager()
        if (stakingComposableInitialized.value) return
        try {
            stakingComposableInitialized.value = true
        } catch (error) {
            console.log("Error initializing staking component :>> ", error)
        }
    }

    async function deposit({ amount, walletProvider, type }: { amount: string, walletProvider: ProviderString, type: "default" | "eigen" }) {
        try {
            const activeNetwork = await detectActiveNetwork(walletProvider)
            if (activeNetwork !== 5) {
                await switchEthersNetwork(walletProvider, "0x5")
                return window.location.reload()
            }

            let signer
            if (browserProvidersList.includes(walletProvider)) {
                signer = getEthersBrowserSigner(walletProvider)
            } else if (walletProvider === "WalletConnect") {
                signer = await getWalletConnectSignerV2()
            } else if (walletProvider === "Ledger") {
                signer = getEthersLedgerSigner()
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
            awaitingStakeOrWithdrawConfirmation.value = true
            const result = await managerSigner.depositStake({ value, type: 2 })
            const confirmation = await result.wait(1)
            if (confirmation) awaitingStakeOrWithdrawConfirmation.value = false
            return confirmation
        } catch (err) {
            console.error(`There was an error in deposit function: ${JSON.stringify(err)}`)
            awaitingStakeOrWithdrawConfirmation.value = false
            return false
        }
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

    async function getUserStake(address: string): Promise<number> {
        if (!stakingComposableInitialized.value) return 0
        try {
            const baseManagerBigNumber = await (baseManager as CasimirManager).getUserStake(address)
            const number = parseFloat(ethers.utils.formatEther(baseManagerBigNumber))
            const eigenManagerBigNumber = await (eigenManager as CasimirManager).getUserStake(address)
            const number2 = parseFloat(ethers.utils.formatEther(eigenManagerBigNumber))
            const total = number + number2
            return total
        } catch (err) {
            console.error(`There was an error in getUserStake function: ${JSON.stringify(err)}`)
            return 0
        }
    }

    async function getWithdrawableBalance({ walletProvider, type }: { walletProvider: ProviderString, type: "default" | "eigen" }) {
        let signer
        if (browserProvidersList.includes(walletProvider)) {
            signer = getEthersBrowserSigner(walletProvider)
        } else if (walletProvider === "WalletConnect") {
            await getWalletConnectSignerV2()
        } else if (walletProvider === "Ledger") {
            getEthersLedgerSigner()
        } else if (walletProvider === "Trezor") {
            getEthersTrezorSigner()
        } else {
            throw new Error(`Invalid wallet provider: ${walletProvider}`)
        }
        const manager = type === "default" ? baseManager : eigenManager
        const managerSigner = (manager as CasimirManager).connect(signer as ethers.Signer)
        const withdrawableBalance = await managerSigner.getWithdrawableBalance()
        const withdrawableBalanceEther = ethers.utils.formatEther(withdrawableBalance)
        return withdrawableBalanceEther
    }

    async function withdraw({ amount, walletProvider, type }: { amount: string, walletProvider: ProviderString, type: "default" | "eigen" }) {
        try {
            const activeNetwork = await detectActiveNetwork(walletProvider)
            if (activeNetwork !== 5) {
                await switchEthersNetwork(walletProvider, "0x5")
                return window.location.reload()
            }
    
            let signer
            if (browserProvidersList.includes(walletProvider)) {
                signer = getEthersBrowserSigner(walletProvider)
            } else if (walletProvider === "WalletConnect") {
                await getWalletConnectSignerV2()
            } else if (walletProvider === "Ledger") {
                getEthersLedgerSigner()
            } else if (walletProvider === "Trezor") {
                getEthersTrezorSigner()
            } else {
                throw new Error(`Invalid wallet provider: ${walletProvider}`)
            }
            const manager = type === "default" ? baseManager : eigenManager
            const managerSigner = (manager as CasimirManager).connect(signer as ethers.Signer)
            const value = ethers.utils.parseEther(amount)
            awaitingStakeOrWithdrawConfirmation.value = true
            const result = await managerSigner.requestWithdrawal(value)
            const confirmation = await result.wait(1)
            if (confirmation) awaitingStakeOrWithdrawConfirmation.value = false
            return confirmation
        } catch (err) {
            console.error(`There was an error in withdraw function: ${JSON.stringify(err)}`)
            awaitingStakeOrWithdrawConfirmation.value = false
            return false
        }
    }

    return {
        awaitingStakeOrWithdrawConfirmation: readonly(awaitingStakeOrWithdrawConfirmation),
        stakingComposableInitialized,
        initializeStakingComposable,
        deposit,
        getDepositFees,
        getUserStake,
        getWithdrawableBalance,
        withdraw
    }
}