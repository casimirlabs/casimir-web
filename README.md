<img width="50px" alt="Casimir logo" src="casimir.png">

# Casimir

[![GitHub discussions](https://img.shields.io/github/discussions/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/discussions)
[![GitHub issues](https://img.shields.io/github/issues/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/issues)
[![GitHub milestones](https://img.shields.io/github/milestones/all/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/milestones)
[![Discord](https://img.shields.io/discord/976524855279226880?logo=discord)](https://discord.com/invite/Vy2b3gSZx8)

> Decentralized staking and asset management

- [About](#about)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Configure](#configure)
    - [Environment Variables](#environment-variables)
  - [Apps](#apps)
    - [@casimir/web](#casimirweb)
  - [Packages](#packages)
  - [Infrastructure](#infrastructure)
    - [@casimir/cdk](#casimircdk)
  - [Services](#services)
- [Layout](#layout)
- [License](#license)

## About

Casimir is a complete platform that allows users to monitor, move, and stake their assets while holding their own keys. With Casimir staking, users can easily and securely move funds in and out of decentralized staking pools that are operated by high-performing validators.

## Development

Get started contributing to Casimir's codebase.

### Prerequisites

Configure the following prerequisite global dependency versions:

1. [Git (v2.x)](https://git-scm.com/downloads).

2. [Docker (v24.x)](https://docs.docker.com/engine/install).

3. [Go (v1.20.x)](https://golang.org/doc/install).

4. [Node.js (LTS)](https://nodejs.org/en/download).

    > [!NOTE]
    > **Using NVM**: Install [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and run `nvm install --lts && nvm alias default lts/*` to set the default version to the latest LTS.

### Setup

Clone the repository and checkout a new branch from develop:

  ```zsh
  git clone https://github.com/casimirlabs/casimir.git
  cd casimir
  git checkout -b <"feature || bug || enhancement">/<"your-branch-name" develop
  ```

We are using [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to simplify monorepo development workflows while keeping project-wide resources accessible. The core commands are below.

Install all repository dependencies and build necessary types:

  ```zsh
  npm install
  ```

Install a dev dependency to the root:

  ```zsh
  npm install -D some-dev-dependency
  ```

Install a dependency or dev dependency to a specific workspace:

  ```zsh
  # dependency
  npm install some-dependency --workspace @casimir/<"workspace-name">

  # dev dependency
  npm install -D some-dev-dependency --workspace @casimir/<"workspace-name">
  ```

### Configure

Customize and override the development environment configuration by creating a [.env](.env) file in the root directory.

#### Environment Variables

| Name | Description | Default |
| - | - | - |
| `PROJECT` | Project name | `casimir` |
| `STAGE` | Environment stage name (`prod || dev || local`) | `local` |
| `ETHEREUM_FORK_BLOCK` | Starting block number for local fork network | (current block) |
| `ETHEREUM_RPC_URL` | Ethereum RPC network URL | `http://127.0.0.1:8545` |
| `NETWORK` | Network name (`mainnet || testnet || hardhat || localhost`) | `localhost` |
| `FORK` | Fork network name (`mainnet || testnet || hardhat`) | `testnet` |
| `FACTORY_ADDRESS` | Base factory contract address | (predicted factory address) |
| `CRYPTO_COMPARE_API_KEY` | CryptoCompare API key | `` |
| `TUNNEL` | Whether to tunnel local network RPC URLs (for remote wallets) | `false` |
| `MOCK_SERVICES` | Whether to mock backend services | `true` |
| `BUILD_PREVIEW` | Whether to preview web app production build | `false` |

### Apps

The apps packages provide a UI to end-users.

#### @casimir/web

Run the main web app with an integrated development environment, including local contracts and services:

  ```zsh
  # From the root directory
  npm run dev
  ```

See the [@casimir/web README.md](apps/web/README.md) for detailed documentation.

### Packages

Theses common packages provide shared code for the project:

- [@casimir/aws](packages/aws): AWS helpers
- [@casimir/data](packages/data): data schemas and operational workflows
- [@casimir/ssv](packages/ssv): SSV helpers
- [@casimir/types](packages/types): shared types
- [@casimir/uniswap](packages/uniswap): Uniswap helpers
- [@casimir/wallets](packages/wallets): wallet helpers

Check for a README.md file in each package directory for detailed usage instructions.

### Infrastructure

The infrastructure packages provide the infrastructure as code for the project.

#### @casimir/cdk

Test the CDK infrastructure:

  ```zsh
  # From the root directory
  npm run test:cdk
  ```

See the [@casimir/cdk README.md](infrastructure/cdk/README.md) for detailed documentation.

### Services

The services packages provide the backend services for the project:

- [@casimir/api](services/api): api server and database

## Layout

Code is organized into work directories (apps, common, contracts, infrastructure, services, scripts, and more listed below).

```tree
├── .github/ (workflows and issue templates)
|   └── workflows/ (gh actions workflows)
├── apps/ (frontend apps)
|   └── web/ (main web app)
├── packages/ (shared code)
|   ├── data/ (data schemas and operational workflows)
|   └── types/ (shared types)
├── infrastructure/ (deployment resources)
|   └── cdk/ (aws stacks)
├── scripts/ (devops and build scripts)
|   ├── deprecated/ (old scripts)
|   ├── staged/ (unfinalized scripts)
|   └── dev.ts (local dev script)
├── services/ (backend services)
|   └── users/ (users service)
└── package.json (project-wide npm dependencies and scripts)
```

## License

This respository is available as open source under the terms of the [Apache License](https://opensource.org/licenses/Apache).

[![License: Apache](https://img.shields.io/badge/License-Apache-green.svg)](LICENSE.md)
