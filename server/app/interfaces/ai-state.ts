import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { RoomGame } from './room-game';

export interface VirtualPlayerState {
    isBeforeObstacle: boolean;
    isSeekingPlayers: boolean;
    hasSlipped: boolean;
    justWonFight: boolean;
}

export interface ClosestObject {
    position: Vec2;
    cost: number;
}

export interface VirtualPlayerTurnData {
    closestObjectData: ClosestObjectData;
    room: RoomGame;
    virtualPlayer: Player;
    virtualPlayerState: VirtualPlayerState;
}

export interface ClosestObjectData {
    closestPlayer: ClosestObject;
    closestItem: ClosestObject;
}
