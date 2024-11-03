export const D6_ATTACK_FIELDS = {
    defenseDieValue: 4,
    attackDieValue: 6,
};

export const D6_DEFENCE_FIELDS = {
    defenseDieValue: 6,
    attackDieValue: 4,
};

// TODO change this to enum
export type DiceType = typeof D6_ATTACK_FIELDS | typeof D6_DEFENCE_FIELDS;

export enum PlayerRole {
    ORGANIZER = 'organizer',
    HUMAN = 'human',
    AGGRESSIVEAI = 'aggressive AI',
    DEFENSIVEAI = 'defensive AI',
}

export enum AvatarChoice {
    AVATAR0,
    AVATAR1,
    AVATAR2,
    AVATAR3,
    AVATAR4,
    AVATAR5,
    AVATAR6,
    AVATAR7,
    AVATAR8,
    AVATAR9,
    AVATAR10,
    AVATAR11,
}
