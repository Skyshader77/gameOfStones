import { PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Game } from './gameplay';

export interface PathFindingInfo {
    priorityQueue: ReachableTile[];
    visited: Set<string>;
    reachableTiles: ReachableTile[];
}

export interface PlayerMovementInfo {
    player: Player;
    node: PathNode;
    futurePosition: Vec2;
}

export interface ExploreAdjacentPositionsInputs {
    current: ReachableTile;
    game: Game;
    queue: ReachableTile[];
    currentPlayer: Player;
    players: Player[];
}

export interface PlayerMoveNode {
    position: Vec2;
    remainingMovement: number;
    path: PathNode[];
}

export interface PathFindingInputs {
    movementOverride?: number;
    currentPlayer?: Player;
    players?: Player[];
    startPosition?: Vec2;
}

export interface MovementFlags {
    isOnClosedDoor: boolean;
    isOnItem: boolean;
    hasTripped: boolean;
    interactiveObject: Vec2 | null;
}
