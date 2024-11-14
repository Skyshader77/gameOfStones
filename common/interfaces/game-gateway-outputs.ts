import { GameEndStats } from "./end-statistics";

export interface PlayerAbandonOutput{
    playerName:string;
    hasAbandoned:boolean;
}

export interface GameEndInfo {
    winnerName: string;
    endStats: GameEndStats;
}
