import { Player } from "@app/interfaces/player";

export class Fight {
    fighters: Player[];
    winner: Player | null;
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
