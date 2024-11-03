import { DiceType } from '../enums/dice.enum';

export const ATTACK_DICE = {
    defenseDieValue: DiceType.Four,
    attackDieValue: DiceType.Six,
};

export const DEFENSE_DICE = {
    defenseDieValue: DiceType.Six,
    attackDieValue: DiceType.Four,
};

// TODO change this to enum
export type Dice = typeof ATTACK_DICE | typeof DEFENSE_DICE;
