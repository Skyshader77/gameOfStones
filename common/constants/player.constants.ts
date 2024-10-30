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

export enum AvatarChoice {
    AVATAR0 = 'goat.jpg',
    AVATAR1 = 'knight.jpg',
    AVATAR2 = 'Aishula.png',
    AVATAR3 = 'Claradore.png',
    AVATAR4 = 'Eugeny.jpg',
    AVATAR5 = 'Gwuine.png',
    AVATAR6 = 'Hardrakka.png',
    AVATAR7 = 'Livia.png',
    AVATAR8 = 'Sassan.png',
    AVATAR9 = 'The_Creator.png',
    AVATAR10 = 'Vakkon.png',
    AVATAR11 = 'Hood.png',
}
