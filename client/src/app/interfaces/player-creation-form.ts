import { PlayerAttributes } from './stats';

export interface PlayerCreationForm {
    name: string;
    avatarId: number;
    statsBonus: PlayerAttributes;
    dice6: PlayerAttributes;
}
