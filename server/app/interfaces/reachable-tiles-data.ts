import { Direction } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Game } from './gameplay';

export interface ReachableTilesData {
    game: Game;
    players: Player[];
    priorityQueue: { pos: Vec2; remainingSpeed: number; path: Direction[] }[];
    avoidPlayers: boolean;
}
