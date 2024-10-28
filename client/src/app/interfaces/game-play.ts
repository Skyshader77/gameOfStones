import { PlayerStatus } from '@common/constants/player.constants';
import { Player } from './player';
import { GameMode } from '@common/enums/game-mode.enum';
import { Map } from '@common/interfaces/map';

export class Game {
    map: Map;
    players: Player[];
    winner: number;
    mode: GameMode;
    currentPlayer: number;
    actionsLeft: number;
    playerStatus: PlayerStatus;
    isDebugMode: boolean;
}
