import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { MovementServiceOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/roomGame';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { DijsktraService } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    room: RoomGame;
    currentPlayer: Player;
    hasTripped: boolean = false;
    constructor(
        private dijstraService: DijsktraService,
        private roomManagerService: RoomManagerService,
    ) {}
    calculateShortestPath(destination: Vec2) {
        return this.dijstraService.findShortestPath(destination, this.room, this.currentPlayer.id);
    }

    processPlayerMovement(destination: Vec2, roomCode: string, turnPlayerId: string): MovementServiceOutput {
        this.room = this.roomManagerService.getRoom(roomCode);
        this.currentPlayer = this.room.players.find((player) => (player.id = turnPlayerId));
        const desiredPath = this.calculateShortestPath(destination);
        const movementResult = this.executeShortestPath(desiredPath);
        if (movementResult.displacementVector.length > 0) {
            this.updatePlayerPosition(movementResult.displacementVector[movementResult.displacementVector.length - 1], turnPlayerId);
        }
        return movementResult;
    }

    executeShortestPath(desiredPath: Vec2[]): MovementServiceOutput {
        this.hasTripped = false;
        const actualPath: Vec2[] = [];
        for (const node of desiredPath) {
            actualPath.push(node);
            if (this.isPlayerOnIce(node) && this.hasPlayerTrippedOnIce()) {
                this.hasTripped = true;
                break;
            }
        }
        return { displacementVector: actualPath, hasTripped: this.hasTripped };
    }

    isPlayerOnIce(node: Vec2): boolean {
        return this.room.game.map.mapArray[node.x][node.y].terrain === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < SLIP_PROBABILITY;
    }

    updatePlayerPosition(node: Vec2, playerId: string) {
        const index = this.room.players.findIndex((player: Player) => player.id === playerId);
        if (index !== -1) {
            this.room.players[index].playerInGame.currentPosition = node;
            this.roomManagerService.updateRoom(this.room.room.roomCode, this.room);
        }
    }
}
