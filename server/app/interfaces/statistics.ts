import { ItemType } from '@common/enums/item-type.enum';
import { Vec2 } from '@common/interfaces/vec2';

export interface GameStats {
    startTime: Date;
    turnCount: number;
    visitedTiles: boolean[][];
    interactedDoors: Vec2[];
    playersWithFlag: string[];
    doorCount: number;
    walkableTilesCount: number;
    playerStats: Map<string, PlayerStats>;
}

export interface PlayerStats {
    fightCount: number;
    winCount: number;
    lossCount: number;
    evasionCount: number;
    totalHpLost: number;
    totalDamageDealt: number;
    pickedItems: ItemType[];
    visitedTiles: boolean[][];
}
