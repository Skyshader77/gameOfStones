export interface PlayerFightInfo {
    fighterName: string;
    evasions: number;
}

export interface DiceRoll {
    fighterRole: string;
    roll: number;
}

export enum FightState {
    Attack,
    Idle,
    Evade,
    Start,
    End,
    Death,
}
