<img width="50px" alt="Casimir logo" src="https://avatars.githubusercontent.com/u/159835967">

# Casimir Web

[![GitHub discussions](https://img.shields.io/github/discussions/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/discussions)
[![GitHub issues](https://img.shields.io/github/issues/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/issues)
[![GitHub milestones](https://img.shields.io/github/milestones/all/consensusnetworks/casimir)](https://github.com/consensusnetworks/casimir/milestones)
[![Discord](https://img.shields.io/discord/976524855279226880?logo=discord)](https://discord.com/invite/Vy2b3gSZx8)

> Casimir self-custodial restaking platform

- [About](#about)
- [Get Started](#get-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Configure](#configure)
  - [Usage](#usage)
    - [Install](#install)
    - [Dev](#dev)
    - [Build](#build)
    - [Preview](#preview)
- [License](#license)

## About

Casimir is a complete platform that allows users to monitor, move, and stake their assets while holding their own keys. With Casimir staking, users can easily and securely move funds in and out of decentralized staking pools that are operated by high-performing validators.

## Get Started

Get started contributing to Casimir's codebase.

### Prerequisites

Configure the following prerequisite global dependency versions:

1. [Git (v2.x)](https://git-scm.com/downloads).

2. [Node.js (LTS)](https://nodejs.org/en/download).

  > [!NOTE]
  > **Using NVM**: Install [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and run `nvm install --lts && nvm alias default lts/*` to set the default version to the latest LTS.

### Setup

Clone the repository and checkout a new branch from develop.

```zsh
git clone https://github.com/casimirlabs/casimir.git
cd casimir
git checkout -b <"feature || bug || enhancement">/<"your-branch-name" develop
```

### Configure

Customize and override the development environment configuration by creating a [.env](.env) file in the root directory.

> [!NOTE]
> Any environment variable that needs to be available during runtime must use the `PUBLIC_` prefix.

| Name | Description | Default |
| - | - | - |
| `PUBLIC_NETWORK` | Network name (`mainnet` or `holesky`) | `holesky` |
| `PUBLIC_ETHEREUM_RPC_URL` | Ethereum RPC URL | `http://127.0.0.1:8545` |
| `PUBLIC_CRYPTO_COMPARE_API_KEY` | CryptoCompare API key | `""` |
| `PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | `""` |

### Usage

Use the `package.json` interface to run project commands.

#### Install

Install all project dependencies.

```sh
npm install
```

#### Dev

Run the web app in development mode.

```sh
npm run dev
```

#### Build

Build the web app for production to the `dist` folder.

```sh
npm run build
```

#### Preview

Run the web app in production mode.

```sh
npm run preview
```

## License

This respository is available as open source under the terms of the [Apache License](https://opensource.org/licenses/Apache).

[![License: Apache](https://img.shields.io/badge/License-Apache-green.svg)](LICENSE.md)
