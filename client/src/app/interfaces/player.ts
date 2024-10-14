import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './map';

export class Player {
    id: string;
    userName: string;
    avatar: AvatarChoice;
    spriteSheet: SpriteSheetChoice;
    isHuman: boolean;
    roomCode: string;
    statistics: PlayerStatistics;
    playerInGame: PlayerInGame;
}

export interface PlayerStatistics {
    numbVictories: number;
    numbDefeats: number;
    numbEscapes: number;
    numbBattles: number;
    totalHpLost: number;
    totalDamageGiven: number;
    numbPickedUpItems: number;
    percentageMapVisited: number;
}

export interface PlayerInGame {
    hp: number;
    movementSpeed: number;
    attack: number;
    defense: number;
    inventory: Item[];
    currentPosition: Vec2;
    hasAbandonned: boolean;
}
