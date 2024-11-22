import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TILE_COSTS_AI, TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map, MovementFlags, MovementServiceOutput, PathNode, PlayerMoveNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '../room-manager/room-manager.service';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
@Injectable()
export class PlayerMovementService {
    constructor(
        private dijkstraService: PathfindingService,
        private gameStatsService: GameStatsService,
        private roomManagerService: RoomManagerService,
        private socketManagerService: SocketManagerService,
    ) { }

    calculateShortestPath(room: RoomGame, destination: Vec2, isSeekingPlayers: boolean): ReachableTile {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const reachableTiles = this.getReachableTiles(room, currentPlayer, isSeekingPlayers);

        return this.dijkstraService.getOptimalPath(reachableTiles, destination);
    }

    executePlayerMovement(destination: Vec2, room: RoomGame, isSeekingPlayers: boolean): MovementServiceOutput {
        const destinationTile = this.calculateShortestPath(room, destination, isSeekingPlayers);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);

        const movementResult = this.executePathForPlayer(destinationTile, room, currentPlayer);

        if (this.hasValidPath(movementResult)) {
            this.updateCurrentPlayerPosition(movementResult.optimalPath.position, room, movementResult.optimalPath.remainingMovement);
        }
        return movementResult;
    }

    emitReachableTiles(room: RoomGame): void {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.getReachableTiles(room, currentPlayer, false);
            currentPlayerSocket.emit(GameEvents.TurnInfo, reachableTiles);
        }
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

    getReachableTiles(room: RoomGame, player: Player, isSeekingPlayers: boolean): ReachableTile[] {
        return isPlayerHuman(player)
            ? this.dijkstraService.dijkstraReachableTiles(room.players, room.game)
            : this.dijkstraService.dijkstraReachableTilesAi(room.players, room.game, isSeekingPlayers);
    }

    private executePathForPlayer(destinationTile: ReachableTile, room: RoomGame, player: Player): MovementServiceOutput {
        return isPlayerHuman(player) ? this.executeHumanMove(destinationTile, room) : this.executeBotMove(destinationTile, room);
    }

    executeBotMove(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const playerMoveNode = this.createPlayerNode(currentPlayer);
        const movementFields = this.createMovementFlags();

        for (const direction of destinationTile.path) {
            const shouldStopMoving = this.processAINode(direction, playerMoveNode, movementFields, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldStopMoving) break;
        }
        return this.createMovementOutput(destinationTile, playerMoveNode, movementFields, true);
    }

    executeHumanMove(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const playerMoveNode = this.createPlayerNode(currentPlayer);
        const movementFields = this.createMovementFlags();

        for (const direction of destinationTile.path) {
            const shouldStopMoving = this.processHumanNode(direction, playerMoveNode, movementFields, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldStopMoving) break;
        }

        return this.createMovementOutput(destinationTile, playerMoveNode, movementFields, false);
    }

    private processAINode(node: PathNode, playerMoveNode: PlayerMoveNode, movementFlags: MovementFlags, room: RoomGame): boolean {
        const delta = directionToVec2Map[node.direction];
        let futurePosition: Vec2 = { ...playerMoveNode.position };
        futurePosition.x += delta.x;
        futurePosition.y += delta.y;

        const tileCost = this.computeTileCostForAI(futurePosition, room);

        movementFlags.isOnClosedDoor = this.isPlayerOnClosedDoor(futurePosition, room);
        movementFlags.isOnItem = this.isPlayerOnItem(futurePosition, room);
        movementFlags.hasTripped = this.checkForIceTrip(futurePosition, room);

        if (this.shouldStopMovement(movementFlags)) {
            this.updateAINode(futurePosition, tileCost, playerMoveNode, node);
            return true;
        }

        if (this.isBlockedByObstacle(movementFlags, futurePosition, room)) {
            movementFlags.isNextToInteractableObject = true;
            return true;
        }

        if (playerMoveNode.remainingMovement - tileCost < 0) {
            playerMoveNode.remainingMovement = 0;
            return true;
        }

        this.updateAINode(futurePosition, tileCost, playerMoveNode, node);
        return false;
    }

    private processHumanNode(node: PathNode, playerMoveNode: PlayerMoveNode, movementFlags: MovementFlags, room: RoomGame): boolean {
        const delta = directionToVec2Map[node.direction];
        playerMoveNode.position.x += delta.x;
        playerMoveNode.position.y += delta.y;
        playerMoveNode.path.push(node);

        movementFlags.isOnItem = this.isPlayerOnItem(playerMoveNode.position, room);
        movementFlags.hasTripped = this.checkForIceTrip(playerMoveNode.position, room);

        return movementFlags.isOnItem || movementFlags.hasTripped;
    }

    private updateAINode(futurePosition: Vec2, tileCost: number, playerMoveNode: PlayerMoveNode, node: PathNode): void {
        playerMoveNode.remainingMovement -= tileCost;
        playerMoveNode.position = futurePosition;
        playerMoveNode.path.push(node);
    }

    private createMovementOutput(
        destinationTile: ReachableTile,
        playerMoveNode: PlayerMoveNode,
        movementFlags: MovementFlags,
        isAI: boolean,
    ): MovementServiceOutput {
        if (isAI || movementFlags.hasTripped || movementFlags.isOnItem) {
            destinationTile.path = playerMoveNode.path;
            destinationTile.position = { ...playerMoveNode.position };
        }
        if (isAI) destinationTile.remainingMovement = playerMoveNode.remainingMovement;

        return {
            optimalPath: destinationTile,
            hasTripped: movementFlags.hasTripped,
            isOnItem: movementFlags.isOnItem,
            isNextToInteractableObject: isAI ? movementFlags.isNextToInteractableObject : false,
        };
    }

    private updateCurrentPlayerPosition(node: Vec2, room: RoomGame, remainingMovement: number) {
        const index = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        if (index !== -1) {
            room.players[index].playerInGame.currentPosition = node;
            room.players[index].playerInGame.remainingMovement = remainingMovement;
        }
    }

    private createPlayerNode(player: Player): PlayerMoveNode {
        return {
            position: { ...player.playerInGame.currentPosition },
            remainingMovement: player.playerInGame.remainingMovement,
            path: [] as PathNode[],
        };
    }

    private createMovementFlags(): MovementFlags {
        return {
            isOnClosedDoor: false,
            isOnItem: false,
            hasTripped: false,
            isNextToInteractableObject: false,
        };
    }

    private hasValidPath(movementResult: MovementServiceOutput): boolean {
        return movementResult.optimalPath.path.length > 0;
    }

    private shouldStopMovement(movementFlags: MovementFlags): boolean {
        return movementFlags.isOnItem || movementFlags.hasTripped;
    }

    private isBlockedByObstacle(movementFlags: MovementFlags, futurePosition: Vec2, room: RoomGame): boolean {
        return movementFlags.isOnClosedDoor || isAnotherPlayerPresentOnTile(futurePosition, room.players);
    }

    private checkForIceTrip(position: Vec2, room: RoomGame): boolean {
        return this.isPlayerOnIce(position, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
    }

    private isPlayerOnClosedDoor(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.ClosedDoor;
    }

    private computeTileCostForAI(position: Vec2, room: RoomGame) {
        return TILE_COSTS_AI[room.game.map.mapArray[position.y][position.x]];
    }
}
