export interface StakeDetails {
    operatorType: "Default" | "Eigen"
    address: string
    amountStaked: number
    availableToWithdraw: number
    rewards?: number
    WithdrawalInitiated?: number
    WithdrawalRequested?: number
    WithdrawalFulfilled?: number
}