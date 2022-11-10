import { $, argv, echo, chalk } from 'zx'
import { getSecret } from '@casimir/aws-helpers'

/**
 * Run local Ethereum nodes and deploy Ethereum contracts
 * 
 * Arguments:
 *      --fork: mainnet or testnet (optional, i.e., --fork=mainnet)
 * 
 * For more info see:
 *      - https://hardhat.org/hardhat-network/docs/overview
 */
void async function () {
    // Fetch remote submodule code
    $`git submodule update --init --recursive`

    // Get shared resources
    const seed = await getSecret('consensus-networks-bip39-seed')
    process.env.BIP39_SEED = seed
    echo(chalk.bgBlackBright('Your mnemonic is ') + chalk.bgBlue(seed))

    // Set fork rpc if requested, default fork to mainnet if set vaguely
    const networks = { mainnet: 'mainnet', testnet: 'goerli' }
    const fork = argv.fork === 'true' ? 'mainnet' : argv.fork
    if (fork) {
        const key = await getSecret(`consensus-networks-ethereum-${fork}`)
        const rpc = `https://eth-${networks[fork]}.g.alchemy.com/v2/${key}`
        process.env.ETHEREUM_FORK_RPC = rpc
        echo(chalk.bgBlackBright('Using ') + chalk.bgBlue(fork) + chalk.bgBlackBright(` fork at ${rpc}`))
    }

    $`npm run dev:execution-layer --workspace @casimir/ethereum`
    $`npm run dev:consensus-layer --workspace @casimir/ethereum`
    // $`npm run dev:ssv`
}()