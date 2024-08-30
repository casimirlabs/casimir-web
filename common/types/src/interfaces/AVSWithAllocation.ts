import { AVS } from "./AVS"

export interface AVSWithAllocation extends AVS {
    allocatedPercentage: number;
    isLocked: boolean;
}
