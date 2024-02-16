export interface StakeDetails {
    operatorType: "Default" | "Eigen"
    address: string
    amountStaked: number
    availableToWithdraw: number
    rewards?: number
    initiatedWithdrawals?: number
    requestedWithdrawals?: number
    fulfilledWithdrawals?: number
}