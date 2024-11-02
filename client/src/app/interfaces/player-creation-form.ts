import { PlayerAttributeType } from './stats';

export interface PlayerCreationForm {
    name: string;
    avatarId: number;
    statsBonus: PlayerAttributeType;
    dice6: PlayerAttributeType;
}
