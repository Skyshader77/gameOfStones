import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { DijkstraServiceOutput, MovementServiceOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@app/interfaces/tile-terrain';
import { DijkstraService } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    constructor(
        private dijstraService: DijkstraService,
        private roomManagerService: RoomManagerService,
    ) {}
    calculateShortestPath(destination: Vec2, room: RoomGame, turnPlayerId: string) {
        return this.dijstraService.findShortestPath(destination, room, turnPlayerId);
    }

    processPlayerMovement(destination: Vec2, roomCode: string, turnPlayerName: string): MovementServiceOutput {
        const room = this.roomManagerService.getRoom(roomCode);
        const desiredPath = this.calculateShortestPath(destination, room, turnPlayerName);
        const movementResult = this.executeShortestPath(desiredPath, room);
        if (movementResult.dijkstraServiceOutput.displacementVector.length > 0) {
            this.updatePlayerPosition(
                movementResult.dijkstraServiceOutput.displacementVector[movementResult.dijkstraServiceOutput.displacementVector.length - 1],
                turnPlayerName,
                room,
                movementResult.dijkstraServiceOutput.remainingSpeed,
            );
        }
        return movementResult;
    }

    executeShortestPath(dijkstraServiceOutput: DijkstraServiceOutput, room: RoomGame): MovementServiceOutput {
        const desiredPath = dijkstraServiceOutput.displacementVector;
        let hasTripped = false;
        const actualPath: Vec2[] = [];
        for (const node of desiredPath) {
            actualPath.push(node);
            if (this.isPlayerOnIce(node, room) && this.hasPlayerTrippedOnIce()) {
                hasTripped = true;
                dijkstraServiceOutput.displacementVector = actualPath;
                dijkstraServiceOutput.position = actualPath[actualPath.length - 1];
                break;
            }
        }
        return { dijkstraServiceOutput, hasTripped };
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.x][node.y].terrain === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < SLIP_PROBABILITY;
    }

    updatePlayerPosition(node: Vec2, playerName: string, room: RoomGame, remainingSpeed: number) {
        const roomToUpdate = room;
        // TODO USE A SERVICE FOR THIS
        const index = roomToUpdate.players.findIndex((player: Player) => player.playerInfo.userName === playerName);
        if (index !== -1) {
            roomToUpdate.players[index].playerInGame.currentPosition = node;
            roomToUpdate.players[index].playerInGame.remainingSpeed = remainingSpeed;
            this.roomManagerService.updateRoom(room.room.roomCode, roomToUpdate);
        }
    }
}
