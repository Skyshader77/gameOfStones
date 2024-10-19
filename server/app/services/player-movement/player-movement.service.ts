import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { MovementServiceOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/roomGame';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { DijkstraService } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    hasTripped: boolean = false;
    constructor(
        private dijstraService: DijkstraService,
        private roomManagerService: RoomManagerService,
    ) {}
    calculateShortestPath(destination: Vec2, room: RoomGame, turnPlayerId: string) {
        return this.dijstraService.findShortestPath(destination, room, turnPlayerId);
    }

    processPlayerMovement(destination: Vec2, roomCode: string, turnPlayerId: string): MovementServiceOutput {
        const room = this.roomManagerService.getRoom(roomCode);
        const desiredPath = this.calculateShortestPath(destination, room, turnPlayerId);
        const movementResult = this.executeShortestPath(desiredPath, room);
        if (movementResult.displacementVector.length > 0) {
            this.updatePlayerPosition(movementResult.displacementVector[movementResult.displacementVector.length - 1], turnPlayerId, room);
        }
        return movementResult;
    }

    executeShortestPath(desiredPath: Vec2[], room: RoomGame): MovementServiceOutput {
        this.hasTripped = false;
        const actualPath: Vec2[] = [];
        for (const node of desiredPath) {
            actualPath.push(node);
            if (this.isPlayerOnIce(node, room) && this.hasPlayerTrippedOnIce()) {
                this.hasTripped = true;
                break;
            }
        }
        return { displacementVector: actualPath, hasTripped: this.hasTripped };
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.x][node.y].terrain === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < SLIP_PROBABILITY;
    }

    updatePlayerPosition(node: Vec2, playerId: string, room: RoomGame) {
        const roomToUpdate = room;
        const index = roomToUpdate.players.findIndex((player: Player) => player.id === playerId);
        if (index !== -1) {
            roomToUpdate.players[index].playerInGame.currentPosition = node;
            this.roomManagerService.updateRoom(room.room.roomCode, roomToUpdate);
        }
    }
}
