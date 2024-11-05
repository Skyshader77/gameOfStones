import { Player } from "./player";
import { Vec2 } from "./vec2";

export interface Fight {
    fighters: Player[];
    result: FightResult;
    isFinished: boolean;
    numbEvasionsLeft: number[];
    currentFighter: number;
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
    respawnPosition: Vec2;
    winner: string | null;
    loser: string | null;
}
