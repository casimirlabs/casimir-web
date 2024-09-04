export interface StakeDetails {
    operatorType: "default" | "eigen"
    address: string
    amountStaked: number
    availableToWithdraw: number
    rewards?: number
    WithdrawalInitiated?: number
    WithdrawalRequested?: number
    WithdrawalFulfilled?: number
}