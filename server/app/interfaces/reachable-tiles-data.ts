import { ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Game } from './gameplay';

export interface ReachableTilesData {
    game: Game;
    currentPlayer: Player;
    players: Player[];
    priorityQueue: ReachableTile[];
    avoidPlayers: boolean;
}
