import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { MovementFlags, PlayerMovementInfo } from '@app/interfaces/movement';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { isAnotherPlayerPresentOnTile } from '@app/utils/utilities';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map, MovementServiceOutput, PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    constructor(
        private pathFindingService: PathFindingService,
        private gameStatsService: GameStatsService,
    ) {}

    executePlayerMovement(destination: Vec2, room: RoomGame): MovementServiceOutput {
        const destinationTile = this.calculateShortestPath(room, destination);
        const movementResult = this.executeShortestPath(destinationTile, room);
        return movementResult;
    }

    getReachableTiles(room: RoomGame): ReachableTile[] {
        return this.pathFindingService.dijkstraReachableTilesAlgo(room.players, room.game);
    }

    executeShortestPath(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const movementFlags = this.createMovementFlags();
        const actualPath: PathNode[] = [];
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        const currentPosition = currentPlayer.playerInGame.currentPosition;
        let futurePosition = currentPosition;
        for (const node of destinationTile.path) {
            if (this.shouldStopMovement(movementFlags) || node.remainingMovement < 0) {
                break;
            }

            futurePosition = this.getFuturePosition(currentPosition, node);

            this.updateFlags(movementFlags, futurePosition, room);
            if (!this.isBlockedByObstacle(movementFlags, futurePosition, room)) {
                this.updatePlayerPosition(room, { player: currentPlayer, futurePosition, node }, actualPath);
            }
        }

        this.setTrueDestination(destinationTile, currentPlayer, actualPath);
        currentPlayer.playerInGame.remainingMovement = destinationTile.remainingMovement;
        return this.getMovementOutput(destinationTile, movementFlags);
    }

    private setTrueDestination(destinationTile: ReachableTile, currentPlayer: Player, actualPath: PathNode[]) {
        destinationTile.path = actualPath;
        destinationTile.remainingMovement =
            actualPath.length > 0 ? actualPath[actualPath.length - 1].remainingMovement : currentPlayer.playerInGame.remainingMovement;
        destinationTile.position = currentPlayer.playerInGame.currentPosition;
    }

    private updateFlags(movementFlags: MovementFlags, futurePosition: Vec2, room: RoomGame) {
        movementFlags.isOnItem = this.isPlayerOnItem(futurePosition, room);
        movementFlags.hasTripped = this.checkForIceTrip(futurePosition, room);
        movementFlags.isOnClosedDoor = this.isPlayerOnClosedDoor(futurePosition, room);
        movementFlags.interactiveObject = this.isBlockedByObstacle(movementFlags, futurePosition, room)
            ? { x: futurePosition.x, y: futurePosition.y }
            : null;
    }

    private updatePlayerPosition(room: RoomGame, movementInfo: PlayerMovementInfo, actualPath: PathNode[]) {
        movementInfo.player.playerInGame.currentPosition.x = movementInfo.futurePosition.x;
        movementInfo.player.playerInGame.currentPosition.y = movementInfo.futurePosition.y;
        actualPath.push(movementInfo.node);
        this.gameStatsService.processMovementStats(room.game.stats, movementInfo.player);
    }

    private calculateShortestPath(room: RoomGame, destination: Vec2): ReachableTile {
        const reachableTiles = this.getReachableTiles(room);

        return this.pathFindingService.getOptimalPath(reachableTiles, destination);
    }

    private createMovementFlags(): MovementFlags {
        return {
            isOnClosedDoor: false,
            isOnItem: false,
            hasTripped: false,
            interactiveObject: null,
        };
    }

    private getMovementOutput(destinationTile: ReachableTile, movementFlags: MovementFlags): MovementServiceOutput {
        return {
            optimalPath: destinationTile,
            hasTripped: movementFlags.hasTripped,
            isOnItem: movementFlags.isOnItem,
            interactiveObject: movementFlags.interactiveObject,
        };
    }

    private getFuturePosition(currentPosition: Vec2, node: PathNode): Vec2 {
        const delta = directionToVec2Map[node.direction];
        return { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };
    }

    private shouldStopMovement(movementFlags: MovementFlags): boolean {
        return movementFlags.interactiveObject !== null || movementFlags.isOnItem || movementFlags.hasTripped;
    }

    private isBlockedByObstacle(movementFlags: MovementFlags, futurePosition: Vec2, room: RoomGame): boolean {
        return movementFlags.isOnClosedDoor || isAnotherPlayerPresentOnTile(futurePosition, room.players);
    }

    private isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.Ice;
    }

    private isPlayerOnItem(node: Vec2, room: RoomGame): boolean {
        return room.game.map.placedItems.some(
            (item: Item) => item.type !== ItemType.Start && item.position.x === node.x && item.position.y === node.y,
        );
    }

    private hasPlayerTrippedOnIce(): boolean {
        return Math.random() <= MOVEMENT_CONSTANTS.game.slipProbability;
    }

    private checkForIceTrip(position: Vec2, room: RoomGame): boolean {
        return this.isPlayerOnIce(position, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
    }

    private isPlayerOnClosedDoor(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.ClosedDoor;
    }
}
