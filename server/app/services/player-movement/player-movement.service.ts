import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map, MovementServiceOutput, PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
@Injectable()
export class PlayerMovementService {
    constructor(
        private dijkstraService: PathfindingService,
        private gameStatsService: GameStatsService,
    ) {}

    calculateShortestPath(room: RoomGame, destination: Vec2) {
        const reachableTiles = this.dijkstraService.dijkstraReachableTiles(room.players, room.game);
        return this.dijkstraService.getOptimalPath(reachableTiles, destination);
    }

    getReachableTiles(room: RoomGame) {
        return this.dijkstraService.dijkstraReachableTiles(room.players, room.game);
    }

    processPlayerMovement(destination: Vec2, room: RoomGame): MovementServiceOutput {
        const destinationTile = this.calculateShortestPath(room, destination);
        const movementResult = this.executeShortestPath(destinationTile, room);
        if (movementResult.optimalPath.path.length > 0) {
            this.updateCurrentPlayerPosition(movementResult.optimalPath.position, room, movementResult.optimalPath.remainingMovement);
        }
        return movementResult;
    }

    executeShortestPath(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        let hasTripped = false;
        let isOnItem = false;
        const actualPath: PathNode[] = [];
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        const currentPosition = currentPlayer.playerInGame.currentPosition;
        for (const node of destinationTile.path) {
            const delta = directionToVec2Map[node.direction];
            currentPosition.x = currentPosition.x + delta.x;
            currentPosition.y = currentPosition.y + delta.y;
            actualPath.push(node);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);

            isOnItem = this.isPlayerOnItem(currentPosition, room);
            hasTripped = this.isPlayerOnIce(currentPosition, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
            if (isOnItem || hasTripped) {
                destinationTile.path = actualPath;
                destinationTile.position = currentPosition;
                break;
            }
        }
        return { optimalPath: destinationTile, hasTripped, isOnItem };
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.Ice;
    }

    isPlayerOnItem(node: Vec2, room: RoomGame): boolean {
        return room.game.map.placedItems.some(
            (item: Item) => item.type !== ItemType.Start && item.position.x === node.x && item.position.y === node.y,
        );
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() <= MOVEMENT_CONSTANTS.game.slipProbability;
    }

    private updateCurrentPlayerPosition(newPosition: Vec2, room: RoomGame, remainingMovement: number) {
        const index = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        if (index !== -1) {
            room.players[index].playerInGame.currentPosition = newPosition;
            room.players[index].playerInGame.remainingMovement = remainingMovement;
        }
    }
}
