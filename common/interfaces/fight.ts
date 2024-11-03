import { Player } from "./player";

export interface Fight {
    fighters: Player[];
    result: FightResult;
    isFinished: boolean;
    numbEvasionsLeft: number[];
    currentFighter: number;
    hasPendingAction: boolean;
}

export interface AttackResult {
    hasDealtDamage: boolean;
    wasWinningBlow: boolean;
    attackRoll: number;
    defenseRoll: number;
}

export interface FightTurnInformation {
    currentFighter: string;
    turnTime: number;
}

export interface FightResult {
    winner: string | null;
    loser: string | null;
}
