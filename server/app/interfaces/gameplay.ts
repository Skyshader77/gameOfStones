import { Map } from '@app/model/database/map';
import { PlayerStatus } from '@common/interfaces/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMode } from './gamemode';
import { Player } from './player';

export class Game {
    map: Map;
    players: Player[];
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

export interface MovementServiceOutput {
    displacementVector: Vec2[];
    hasTripped: boolean;
}
