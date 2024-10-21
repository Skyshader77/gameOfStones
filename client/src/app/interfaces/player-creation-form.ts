import { Statistic } from './stats';

export interface PlayerCreationForm {
    name: string;
    avatarId: number;
    statsBonus: Statistic;
    dice6: Statistic;
}
