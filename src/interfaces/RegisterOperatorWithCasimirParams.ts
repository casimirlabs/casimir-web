import { ProviderString } from "."
import { BigNumberish } from "ethers"

export interface RegisterOperatorWithCasimirParams {
    walletProvider: ProviderString
    address: string
    operatorId: BigNumberish
    collateral: string
    nodeUrl: string
}