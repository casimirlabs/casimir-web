import { ref } from 'vue'
import { ethers } from 'ethers'
import { CasimirManager, CasimirViews } from '@casimir/ethereum/build/artifacts/types'
import CasimirManagerJson from '@casimir/ethereum/build/artifacts/src/v1/CasimirManager.sol/CasimirManager.json'
import CasimirViewsJson from '@casimir/ethereum/build/artifacts/src/v1/CasimirManager.sol/CasimirManager.json'
import useEnvironment from './environment'
import useEthers from './ethers'
import useLedger from './ledger'
import usePrice from '@/composables/price'
import useTrezor from './trezor'
import useWalletConnect from './walletConnect'
import { Account, BreakdownAmount, Pool, ProviderString } from '@casimir/types'
import { ReadyOrStakeString } from '@/interfaces/ReadyOrStakeString'

/** Manager contract */
const managerAddress = import.meta.env.PUBLIC_MANAGER_ADDRESS
const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_RPC_URL)
const manager = new ethers.Contract(managerAddress, CasimirManagerJson.abi, provider) as CasimirManager & ethers.Contract

/** Views contract */
const viewsAddress = import.meta.env.PUBLIC_VIEWS_ADDRESS
const views: CasimirViews = new ethers.Contract(viewsAddress, CasimirViewsJson.abi) as CasimirViews

const { getCurrentPrice } = usePrice()

const currentStaked = ref<BreakdownAmount>({
    usd: '$0.00',
    exchange: '0 ETH'
})

const stakingRewards = ref({
    usd: '$0.00',
    exchange: '0 ETH'
})

const totalDeposited = ref({
    usd: '$0.00',
    exchange: '0 ETH'
})

export default function useContracts() {
    const { ethereumURL } = useEnvironment()
    const { ethersProviderList, getEthersBrowserSigner } = useEthers()
    const { getEthersLedgerSigner } = useLedger()
    const { getEthersTrezorSigner } = useTrezor()
    const { isWalletConnectSigner, getEthersWalletConnectSigner } = useWalletConnect()
    
    // watch(user, async () => {
    //     const promises = [] as any[]
    //     const accounts = user.value?.accounts
    //     accounts?.forEach(account => {
    //         promises.push(getUserStakeBalance(account.address))
    //     })
    //     const promisesResults = await Promise.all(promises)
    //     const totalUSD = Math.round(promisesResults.reduce((a, b) => a + b, 0) * 100) / 100
    //     const currentEthPrice = await getCurrentPrice({coin: 'ETH', currency: 'USD'})
    //     const totalETH = (Math.round((totalUSD / currentEthPrice)*100) / 100).toString()
    //     currentStaked.value = {
    //         usd: '$' + totalUSD,
    //         exchange: totalETH + ' ETH'
    //     }
    //     await getUserContractEventsTotals(user.value?.accounts[0].address as string)
    // })

    async function deposit({ amount, walletProvider }: { amount: string, walletProvider: ProviderString }) {
        // const ethAmount = (parseInt(amount) / (await getCurrentPrice({ coin: 'ETH', currency: 'USD' }))).toString()
        const signerCreators = {
            'Browser': getEthersBrowserSigner,
            'Ledger': getEthersLedgerSigner,
            'Trezor': getEthersTrezorSigner,
            'WalletConnect': getEthersWalletConnectSigner
        }
        const signerType = ethersProviderList.includes(walletProvider) ? 'Browser' : walletProvider
        const signerCreator = signerCreators[signerType as keyof typeof signerCreators]
        let signer = signerCreator(walletProvider)
        if (isWalletConnectSigner(signer)) signer = await signer
        const managerSigner = manager.connect(signer as ethers.Signer)
        const fees = await managerSigner.feePercent()
        const depositAmount = parseFloat(amount) * ((100 + fees) / 100)
        const value = ethers.utils.parseEther(depositAmount.toString())
        const result = await managerSigner.depositStake({ value, type: 0 })
        return await result.wait()
    }

    async function getDepositFees() {
        const provider = new ethers.providers.JsonRpcProvider(ethereumURL)
        const fees = await manager.connect(provider).feePercent()
        const feesRounded = Math.round(fees * 100) / 100
        return feesRounded
    }

    async function getPools(address: string, readyOrStake: ReadyOrStakeString): Promise<Pool[]> {
        const { user } = useUsers()
        const provider = new ethers.providers.JsonRpcProvider(ethereumURL)        
        const userStake = await manager.connect(provider).getUserStake(address) // to get user's stake balance
        const poolStake = await manager.connect(provider).getTotalStake() // to get total stake balance
        const poolIds = readyOrStake === 'ready' ? await manager.connect(provider).getReadyPoolIds() : await manager.connect(provider).getStakedPoolIds() // to get ready (open) pool IDs OR to get staked (active) pool IDs

        console.log('userStake :>> ', ethers.utils.formatEther(userStake))
        console.log('poolStake :>> ', ethers.utils.formatEther(poolStake))
        console.log('poolIds :>> ', poolIds)

        return await Promise.all(poolIds.map(async (poolId: number) => {
            const { publicKey, operatorIds } = await views.connect(provider).getPoolDetails(poolId)
            
            // TODO: Decide when/how to get rewards/userRewards
            let pool: Pool = {
                id: poolId,
                rewards: ethers.utils.formatEther(poolStake),
                stake: ethers.utils.formatEther(poolStake),
                userRewards: ethers.utils.formatEther(userStake),
                userStake: ethers.utils.formatEther(userStake)
            }

            if (publicKey) {
                // Validator data from beaconcha.in hardcoded for now
                // const response = await fetch(`https://prater.beaconcha.in/api/v1/validator/${validatorPublicKey}`)
                // const { data } = await response.json()
                // const { status } = data
                const validator = {
                    publicKey,
                    status: 'Active',
                    effectiveness: '0%',
                    apr: '0%', // See issue #205 https://github.com/consensusnetworks/casimir/issues/205#issuecomment-1338142532
                    url: `https://prater.beaconcha.in/validator/${publicKey}`
                }


                // TODO: Replace with less hardcoded network call?
                const operators = await Promise.all(operatorIds.map(async (operatorId) => {
                    const network = 'prater'
                    const response = await fetch(`https://api.ssv.network/api/v3/${network}/operators/${operatorId}`)
                    const { performance } = await response.json()
                    return {
                        id: operatorId.toNumber(),
                        '24HourPerformance': performance['24h'],
                        '30DayPerformance': performance['30d'],
                        url: `https://explorer.ssv.network/operators/${operatorId}`
                    }
                }))

                pool = {
                    ...pool,
                    validator,
                    operators
                }
            }
            
            if (readyOrStake === 'stake') {
                user.value?.accounts.forEach((account: Account) => {
                    if (account.address === address) {
                        account.pools ? account.pools.push(pool) : account.pools = [pool]
                    }
                })
            }
            
            return pool
        }))
    }

    async function getUserStakeBalance(addresses: Array<string>) : Promise<number> {
        const provider = new ethers.providers.JsonRpcProvider(ethereumURL)
        const promises = [] as Array<Promise<ethers.BigNumber>>
        addresses.forEach((address) => {
            promises.push(manager.connect(provider).getUserStake(address))
        })
        const resolvedPromises = await Promise.all(promises)
        console.log('resolvedPromises in getUserStakeBalance :>> ', resolvedPromises)
        const totalStake = resolvedPromises.reduce((a, b) => a.add(b))
        const userStakeUSD = parseFloat(ethers.utils.formatEther(totalStake)) * (await getCurrentPrice({ coin: 'ETH', currency: 'USD' }))
        console.log('totalStake :>> ', totalStake)
        console.log('userStakeUSD :>> ', userStakeUSD)
        currentStaked.value = {
            exchange: '$ ' + ethers.utils.formatEther(totalStake),
            usd: '$ ' + userStakeUSD
        }
        return userStakeUSD
    }

    async function withdraw({ amount, walletProvider }: { amount: string, walletProvider: ProviderString }) {
        const signerCreators = {
            'Browser': getEthersBrowserSigner,
            'Ledger': getEthersLedgerSigner,
            'Trezor': getEthersTrezorSigner,
            'WalletConnect': getEthersWalletConnectSigner
        }
        const signerType = ['MetaMask', 'CoinbaseWallet'].includes(walletProvider) ? 'Browser' : walletProvider
        const signerCreator = signerCreators[signerType as keyof typeof signerCreators]
        let signer = signerCreator(walletProvider)
        if (isWalletConnectSigner(signer)) signer = await signer
        const managerSigner = manager.connect(signer as ethers.Signer)
        const value = ethers.utils.parseEther(amount)
        const result = await managerSigner.requestWithdrawal(value)
        return await result.wait()
    }

    async function getUserContractEventsTotals(address: string) {
        const eventList = [
            'StakeDeposited',
            'StakeRebalanced',
            'WithdrawalInitiated',
        ]
        const eventFilters = eventList.map(event => {
            if (event === 'StakeRebalanced') return manager.filters[event]() // TODO: @shanejearley - is there a better way to handle this?
            return manager.filters[event](address)
        })
        const items = (await Promise.all(eventFilters.map(async eventFilter => await manager.queryFilter(eventFilter, 0, 'latest'))))

        const userEventTotals = eventList.reduce((acc, event) => {
            acc[event] = 0
            return acc
        }, {} as { [key: string]: number })

        for (const item of items) {
            for (const action of item) {
                const { args, event } = action
                const { amount } = args
                const amountInEth = parseFloat(ethers.utils.formatEther(amount))
                userEventTotals[event as string] += amountInEth
            }
        }

        return userEventTotals
    }

    async function setUserContractTotals(eventTotals: any) {
        /* CurrentStaked */
        if (eventTotals.StakeDeposited > 0) {
            const exchangeCurrentStaked = eventTotals.StakeDeposited - eventTotals.WithdrawalInitiated
            const usdCurrentStaked = exchangeCurrentStaked * (await getCurrentPrice({ coin: 'ETH', currency: 'USD' }))
            const exchangeCurrentStakedRounded = Math.round(exchangeCurrentStaked * 100) / 100
            const usdCurrentStakedRounded = Math.round(usdCurrentStaked * 100) / 100
            currentStaked.value = {
                exchange: exchangeCurrentStakedRounded.toString() + ' ETH',
                usd: '$ ' + usdCurrentStakedRounded
            }
        }

        /* Staking Rewards */
        
        /* TotalDeposited */
    }

    // TODO: Add listener / subscription "StakeRebalanced(uint256 amount)" (to composable somewhere)

    return { 
        currentStaked, 
        manager, 
        stakingRewards, 
        totalDeposited, 
        deposit, 
        getDepositFees, 
        getPools, 
        getUserContractEventsTotals, 
        getUserStakeBalance, 
        setUserContractTotals, 
        withdraw 
    }
}