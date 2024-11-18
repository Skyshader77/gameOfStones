import { GameEndStats } from "./end-statistics";
import { ReachableTile } from "./move";
import { PlayerAttributes } from "./player";

export interface PlayerAbandonOutput{
    playerName:string;
    hasAbandoned:boolean;
}

export interface GameEndInfo {
    winnerName: string;
    endStats: GameEndStats;
}

export interface TurnInformation {
    attributes: PlayerAttributes;
    remainingMovement: number;
    reachableTiles: ReachableTile[];
}
