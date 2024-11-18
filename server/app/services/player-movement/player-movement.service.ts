import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TILE_COSTS, TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, MovementServiceOutput, MovementState, PlayerState, ReachableTile } from '@common/interfaces/move';
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
        private socketManagerService: SocketManagerService,
        private roomManagerService: RoomManagerService,
    ) {}

    calculateShortestPath(room: RoomGame, destination: Vec2, isSeekingPlayers: boolean): any {
        const currentPlayer = this.getCurrentPlayer(room);
        const reachableTiles = this.getReachableTiles(room, currentPlayer, isSeekingPlayers);

        return this.dijkstraService.getOptimalPath(reachableTiles, destination);
    }

    processPlayerMovement(destination: Vec2, room: RoomGame, isSeekingPlayers: boolean): MovementServiceOutput {
        const destinationTile = this.calculateShortestPath(room, destination, isSeekingPlayers);
        const currentPlayer = this.getCurrentPlayer(room);

        const movementResult = this.executePathForPlayer(destinationTile, room, currentPlayer);

        if (this.hasValidPath(movementResult)) {
            this.updateCurrentPlayerPosition(movementResult.optimalPath.position, room, movementResult.optimalPath.remainingMovement);
        }
        return movementResult;
    }

    getReachableTiles(room: RoomGame, player: Player, isSeekingPlayers: boolean): ReachableTile[] {
        return isPlayerHuman(player)
            ? this.dijkstraService.dijkstraReachableTiles(room.players, room.game)
            : this.dijkstraService.dijkstraReachableTilesAi(room.players, room.game, isSeekingPlayers);
    }

    executeShortestPathAI(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const currentPlayer = this.getCurrentPlayer(room);
        const playerState = this.createInitialPlayerState(currentPlayer);
        const movementState = this.createInitialMovementState();

        for (const direction of destinationTile.path) {
            const shouldBreak = this.processAIMove(direction, playerState, movementState, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldBreak) break;
        }
        return this.createAiMovementOutput(destinationTile, playerState, movementState);
    }

    executeShortestPathHuman(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        const currentPlayer = this.getCurrentPlayer(room);
        const playerState = this.createInitialPlayerState(currentPlayer);
        const movementState = this.createInitialMovementState();

        for (const direction of destinationTile.path) {
            const shouldBreak = this.processHumanMove(direction, playerState, movementState, room);
            this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
            if (shouldBreak) break;
        }

        return this.createHumanMovementOutput(destinationTile, playerState, movementState);
    }

    computeTileCostForAI(position: Vec2, room: RoomGame) {
        return TILE_COSTS[room.game.map.mapArray[position.y][position.x]];
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.Ice;
    }

    isPlayerOnItem(node: Vec2, room: RoomGame): boolean {
        return room.game.map.placedItems.some(
            (item: Item) => item.type !== ItemType.Start && item.position.x === node.x && item.position.y === node.y,
        );
    }

    isPlayerOnClosedDoor(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.ClosedDoor;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() <= MOVEMENT_CONSTANTS.game.slipProbability;
    }

    updateCurrentPlayerPosition(node: Vec2, room: RoomGame, remainingMovement: number) {
        const index = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        if (index !== -1) {
            room.players[index].playerInGame.currentPosition = node;
            room.players[index].playerInGame.remainingMovement = remainingMovement;
        }
    }

    emitReachableTiles(room: RoomGame): void {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.GAME);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.getReachableTiles(room, currentPlayer, false);
            currentPlayerSocket.emit(GameEvents.PossibleMovement, reachableTiles);
        }
    }

    private getCurrentPlayer(room: RoomGame): Player {
        return room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
    }

    private executePathForPlayer(destinationTile: any, room: RoomGame, player: Player): MovementServiceOutput {
        return isPlayerHuman(player) ? this.executeShortestPathHuman(destinationTile, room) : this.executeShortestPathAI(destinationTile, room);
    }

    private hasValidPath(movementResult: MovementServiceOutput): boolean {
        return movementResult.optimalPath.path.length > 0;
    }

    private createInitialPlayerState(player: Player): PlayerState {
        return {
            position: { ...player.playerInGame.currentPosition },
            remainingMovement: player.playerInGame.attributes.speed,
            previousPosition: null as Vec2 | null,
            path: [] as Direction[],
        };
    }

    private createInitialMovementState(): MovementState {
        return {
            isOnClosedDoor: false,
            isOnItem: false,
            hasTripped: false,
            isNextToInteractableObject: false,
        };
    }

    private processAIMove(direction: Direction, playerState: any, movementState: any, room: RoomGame): boolean {
        const delta = directionToVec2Map[direction];
        this.updatePosition(playerState.position, delta);

        const tileCost = this.computeTileCostForAI(playerState.position, room);

        movementState.isOnClosedDoor = this.isPlayerOnClosedDoor(playerState.position, room);
        movementState.isOnItem = this.isPlayerOnItem(playerState.position, room);
        movementState.hasTripped = this.checkForIceTrip(playerState.position, room);

        if (this.shouldStopMovement(movementState)) {
            playerState.path.push(direction);
            playerState.remainingMovement -= tileCost;
            return true;
        }

        if (this.isBlockedByObstacle(movementState, playerState, room)) {
            movementState.isNextToInteractableObject = true;
            if (playerState.previousPosition) {
                Object.assign(playerState.position, playerState.previousPosition);
            }
            return true;
        }

        if (playerState.remainingMovement - tileCost <= 0) {
            playerState.remainingMovement = 0;
            return true;
        }

        playerState.remainingMovement -= tileCost;
        playerState.previousPosition = { ...playerState.position };
        playerState.path.push(direction);
        return false;
    }

    private processHumanMove(direction: Direction, playerState: PlayerState, movementState: MovementState, room: RoomGame): boolean {
        const delta = directionToVec2Map[direction];
        this.updatePosition(playerState.position, delta);
        playerState.path.push(direction);

        movementState.isOnItem = this.isPlayerOnItem(playerState.position, room);
        movementState.hasTripped = this.checkForIceTrip(playerState.position, room);

        return movementState.isOnItem || movementState.hasTripped;
    }

    private updatePosition(position: Vec2, delta: Vec2): void {
        position.x += delta.x;
        position.y += delta.y;
    }

    private shouldStopMovement(movementState: MovementState): boolean {
        return movementState.isOnItem || movementState.hasTripped;
    }

    private isBlockedByObstacle(movementState: MovementState, playerState: PlayerState, room: RoomGame): boolean {
        return movementState.isOnClosedDoor || isAnotherPlayerPresentOnTile(playerState.position, room.players);
    }

    private checkForIceTrip(position: Vec2, room: RoomGame): boolean {
        return this.isPlayerOnIce(position, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
    }

    private createAiMovementOutput(destinationTile: ReachableTile, playerState: PlayerState, movementState: MovementState): MovementServiceOutput {
        destinationTile.path = playerState.path;
        destinationTile.position = { ...playerState.position };
        destinationTile.remainingMovement = playerState.remainingMovement;

        return {
            optimalPath: destinationTile,
            hasTripped: movementState.hasTripped,
            isOnItem: movementState.isOnItem,
            isNextToInteractableObject: movementState.isNextToInteractableObject,
        };
    }

    private createHumanMovementOutput(destinationTile: ReachableTile, playerState: any, movementState: MovementState): MovementServiceOutput {
        if (movementState.hasTripped || movementState.isOnItem) {
            destinationTile.path = playerState.path;
            destinationTile.position = playerState.position;
        }

        return {
            optimalPath: destinationTile,
            hasTripped: movementState.hasTripped,
            isOnItem: movementState.isOnItem,
            isNextToInteractableObject: false,
        };
    }
}
