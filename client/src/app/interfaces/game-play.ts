import { Player } from './player';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Map } from '@common/interfaces/map';

export class Game {
    map: Map;
    players: Player[];
    winner: number;
    mode: GameMode;
    currentPlayer: number;
    actionsLeft: number;
    status: GameStatus;
    isDebugMode: boolean;
}
