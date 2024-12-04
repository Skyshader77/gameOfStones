import { ATTACK_DICE, DEFENSE_DICE } from '@common/constants/dice.constants';

export type Dice = typeof ATTACK_DICE | typeof DEFENSE_DICE;
