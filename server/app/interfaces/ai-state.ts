import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, Subscription } from 'rxjs';
import { RoomGame } from './room-game';

export interface VirtualPlayerState {
    obstacle: Vec2 | null;
    isSeekingPlayers: boolean;
    hasSlipped: boolean;
    justExitedFight: boolean;
    aiTurnSubject: Subject<void>;
    aiTurnSubscription: Subscription;
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

export interface DefensiveItemStrategyData {
    closestObjectData: ClosestObjectData;
    closestDefensiveItem: ClosestObject;
    virtualPlayerState: VirtualPlayerState;
    virtualPlayer: Player;
}