import { PlayerStatus } from '@common/constants/player.constants';
import { GameMode, Map } from './map';
import { Player } from './player';

export class Game {
    map: Map;
    players: Player[];
    winner: number;
    mode: GameMode;
    currentPlayer: number;
    actionsLeft: number;
    playerStatus: PlayerStatus;
    isDebugMode: boolean;
    timerValue: number;
}
