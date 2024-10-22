export const D6_ATTACK_FIELDS = {
    defenseDieValue: 4,
    attackDieValue: 6,
};

export const D6_DEFENCE_FIELDS = {
    defenseDieValue: 6,
    attackDieValue: 4,
};

export type DiceType = typeof D6_ATTACK_FIELDS | typeof D6_DEFENCE_FIELDS;

export enum PlayerRole {
    ORGANIZER = 'organizer',
    HUMAN = 'human',
    AGGRESSIVEAI = 'aggressive AI',
    DEFENSIVEAI = 'defensive AI',
}

export enum PlayerStatus {
    WAITING,
    OVERWORLD,
    FIGHT,
    FINISHED,
}
