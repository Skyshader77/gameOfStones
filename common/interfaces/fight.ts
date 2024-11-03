import { Player } from "./player";

export interface Fight {
    fighters: Player[];
    winner: string;
    loser: string;
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
