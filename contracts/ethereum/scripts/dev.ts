import { deployContract } from '@casimir/hardhat'
import { ContractConfig, DeploymentConfig, Validator } from '@casimir/types'
import { validatorStore } from '@casimir/data'
import { CasimirManager, MockAggregator } from '../build/artifacts/types'
import { ethers } from 'hardhat'

void async function () {
    let casimirManager: CasimirManager | undefined
    let mockAggregator: MockAggregator | undefined
    const [ , , , , distributor] = await ethers.getSigners()
    let config: DeploymentConfig = {
        CasimirManager: {
            address: '',
            args: {
                beaconDepositAddress: process.env.BEACON_DEPOSIT_ADDRESS,
                linkFeedAddress: process.env.LINK_FEED_ADDRESS,
                linkTokenAddress: process.env.LINK_TOKEN_ADDRESS,
                ssvNetworkAddress: process.env.SSV_NETWORK_ADDRESS,
                ssvTokenAddress: process.env.SSV_TOKEN_ADDRESS,
                swapFactoryAddress: process.env.SWAP_FACTORY_ADDRESS,
                swapRouterAddress: process.env.SWAP_ROUTER_ADDRESS,
                wethTokenAddress: process.env.WETH_TOKEN_ADDRESS
            },
            options: {},
            proxy: false
        }
    }

    if (process.env.MOCK_EXTERNAL_CONTRACTS === 'true') {
        config = {
            MockAggregator: {
                address: '',
                args: {
                    decimals: 18,
                    initialAnswer: 0
                },
                options: {},
                proxy: false
            },
            ...config
        }
    }

    for (const name in config) {
        console.log(`Deploying ${name} contract...`)

        /** Link mock external contracts to Casimir */
        if (name === 'CasimirManager') {
            (config[name as keyof typeof config] as ContractConfig).args.linkFeedAddress = config.MockAggregator?.address
        }

        const { args, options, proxy } = config[name as keyof typeof config] as ContractConfig

        const contract = await deployContract(name, proxy, args, options)
        const { address } = contract

        // Semi-colon needed
        console.log(`${name} contract deployed to ${address}`);

        // Save contract address for next loop
        (config[name as keyof DeploymentConfig] as ContractConfig).address = address

        // Save SSV manager for export
        if (name == 'CasimirManager') casimirManager = contract as CasimirManager

        // Save mock aggregator for export
        if (name == 'MockAggregator') mockAggregator = contract as MockAggregator
    }

    const validators = Object.keys(validatorStore).map((key) => validatorStore[key]).slice(0, 2) as Validator[]
    for (const validator of validators) {
        const {
            depositDataRoot,
            publicKey,
            operatorIds,
            sharesEncrypted,
            sharesPublicKeys,
            signature,
            withdrawalCredentials
        } = validator
        const registration = await casimirManager?.addValidator(
            depositDataRoot,
            publicKey,
            operatorIds,
            sharesEncrypted,
            sharesPublicKeys,
            signature,
            withdrawalCredentials
        )
        await registration?.wait()
    }

    /** Distribute rewards every ${blocksPerReward} blocks */
    const blocksPerReward = 10

    /** Simulation amount of reward to distribute per staked validator */
    const rewardPerValidator = 0.1

    let lastRewardBlock = await ethers.provider.getBlockNumber()
    ethers.provider.on('block', async (block) => {
        if (block - blocksPerReward === lastRewardBlock) {
            lastRewardBlock = block
            const activeValidatorPublicKeys = await casimirManager?.getStakedValidatorPublicKeys()
            if (activeValidatorPublicKeys?.length) {
                console.log(`Distributing rewards from ${activeValidatorPublicKeys.length} active validators...`)
                const rewardAmount = (rewardPerValidator * activeValidatorPublicKeys.length).toString()
                const reward = await distributor.sendTransaction({ to: casimirManager?.address, value: ethers.utils.parseEther(rewardAmount) })
                await reward.wait()
            }
        }
    })
}()