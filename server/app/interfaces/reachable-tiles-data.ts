import { PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Game } from './gameplay';
import { MovementFlags, PlayerMoveNode } from './movement';

export interface ReachableTilesData {
    game: Game;
    currentPlayer: Player;
    players: Player[];
    isSeekingPlayers: boolean;
    isVirtualPlayer: boolean;
    priorityQueue: ReachableTile[];
}

export interface MovementNodeData {
    node: PathNode;
    playerMoveNode: PlayerMoveNode;
    movementFlags: MovementFlags;
}

export interface AIMovementNodeData {
    futurePosition: Vec2;
    tileCost: number;
    playerMoveNode: PlayerMoveNode;
    node: PathNode;
}
export interface ProcessedMovementData {
    destinationTile: ReachableTile;
    playerMoveNode: PlayerMoveNode;
    movementFlags: MovementFlags;
    isAI: boolean;
}
