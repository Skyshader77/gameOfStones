import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TILE_COSTS, TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, MovementServiceOutput, MovementFlags, PlayerPosition, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PlayerMovementService {
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private roomManagerService: RoomManagerService;
    constructor(
        private dijkstraService: PathfindingService,
        private gameStatsService: GameStatsService,
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
            currentPlayerSocket.emit(GameEvents.PossibleMovement, reachableTiles);
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
        const playerPosition = this.createPlayerPosition(currentPlayer);
        const movementFields = this.createMovementFlags();

        for (const direction of destinationTile.path) {
            const shouldStopMoving = this.processAINode(direction, playerPosition, movementFields, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldStopMoving) break;
        }
        return this.createMovementOutput(destinationTile, playerPosition, movementFields, true);
    }

    executeHumanMove(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const playerPosition = this.createPlayerPosition(currentPlayer);
        const movementFields = this.createMovementFlags();

        for (const direction of destinationTile.path) {
            const shouldStopMoving = this.processHumanNode(direction, playerPosition, movementFields, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldStopMoving) break;
        }

        return this.createMovementOutput(destinationTile, playerPosition, movementFields, false);
    }

    private processAINode(direction: Direction, playerPosition: PlayerPosition, movementFlags: MovementFlags, room: RoomGame): boolean {
        const delta = directionToVec2Map[direction];
        let futurePosition: Vec2 = { ...playerPosition.position };
        futurePosition.x += delta.x;
        futurePosition.y += delta.y;

        const tileCost = this.computeTileCostForAI(futurePosition, room);

        movementFlags.isOnClosedDoor = this.isPlayerOnClosedDoor(futurePosition, room);
        movementFlags.isOnItem = this.isPlayerOnItem(futurePosition, room);
        movementFlags.hasTripped = this.checkForIceTrip(futurePosition, room);

        if (this.shouldStopMovement(movementFlags)) {
            this.updateAIPosition(futurePosition, tileCost, playerPosition, direction);
            return true;
        }

        if (this.isBlockedByObstacle(movementFlags, futurePosition, room)) {
            movementFlags.isNextToInteractableObject = true;
            return true;
        }

        if (playerPosition.remainingMovement - tileCost < 0) {
            playerPosition.remainingMovement = 0;
            return true;
        }

        this.updateAIPosition(futurePosition, tileCost, playerPosition, direction);
        return false;
    }

    private processHumanNode(direction: Direction, playerPosition: PlayerPosition, movementFlags: MovementFlags, room: RoomGame): boolean {
        const delta = directionToVec2Map[direction];
        playerPosition.position.x += delta.x;
        playerPosition.position.y += delta.y;
        playerPosition.path.push(direction);

        movementFlags.isOnItem = this.isPlayerOnItem(playerPosition.position, room);
        movementFlags.hasTripped = this.checkForIceTrip(playerPosition.position, room);

        return movementFlags.isOnItem || movementFlags.hasTripped;
    }


    private updateAIPosition(futurePosition: Vec2, tileCost: number, playerPosition: PlayerPosition, direction: Direction): void {
        playerPosition.remainingMovement -= tileCost;
        playerPosition.position = futurePosition;
        playerPosition.path.push(direction);
    }

    private createMovementOutput(
        destinationTile: ReachableTile,
        playerPosition: PlayerPosition,
        movementFlags: MovementFlags,
        isAI: boolean,
    ): MovementServiceOutput {
        if (isAI || movementFlags.hasTripped || movementFlags.isOnItem) {
            destinationTile.path = playerPosition.path;
            destinationTile.position = { ...playerPosition.position };
        }
        if (isAI) destinationTile.remainingMovement = playerPosition.remainingMovement;

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

    private createPlayerPosition(player: Player): PlayerPosition {
        return {
            position: { ...player.playerInGame.currentPosition },
            remainingMovement: player.playerInGame.remainingMovement,
            path: [] as Direction[],
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
        return TILE_COSTS[room.game.map.mapArray[position.y][position.x]];
    }
}
