import { Map } from '@app/model/database/map';
import { PlayerStatus } from '@common/interfaces/player.constants';
import { GameMode } from './gamemode';

export class Game {
    map: Map;
    winner: number;
    mode: GameMode;
    currentPlayer: string;
    actionsLeft: number;
    playerStatus: PlayerStatus;
    stats: GameStats;
    isDebugMode: boolean;
    timerValue: number;
}

export class GameStats {
    timeTaken: Date;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
}
