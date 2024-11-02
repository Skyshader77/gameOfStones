import { GameTimer } from "@app/interfaces/gameplay";
import { Player } from "@app/interfaces/player";

export class Fight {
    fighters: Player[];
    winner: string;
    loser: string;
    numbEvasionsLeft: number[];
    currentFighter: number;
    hasPendingAction: boolean;
    timer: GameTimer;
}

export interface AttackResult {
    hasDealtDamage: boolean;
    wasWinningBlow: boolean;
    attackRoll: number;
    defenseRoll: number;
}
