import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { MovementServiceOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@app/interfaces/tile-terrain';
import { Pathfinding } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    constructor(
        private roomManagerService: RoomManagerService,
    ) {}
    calculateShortestPath(room: RoomGame, destination:Vec2 ) {
        const reachableTiles=Pathfinding.dijkstraReachableTiles(room);
        return Pathfinding.getOptimalPath(reachableTiles, destination)
    }

    processPlayerMovement(destination: Vec2, roomCode: string): MovementServiceOutput {
        const room = this.roomManagerService.getRoom(roomCode);
        const destinationTile = this.calculateShortestPath(room, destination);
        const movementResult = this.executeShortestPath(destinationTile, room);
        if (movementResult.optimalPath.path.length > 0) {
            this.updateCurrentPlayerPosition(
                movementResult.optimalPath.position,
                room,
                movementResult.optimalPath.remainingSpeed,
            );
        }
        return movementResult;
    }

    executeShortestPath(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        let hasTripped = false;
        const actualPath: Direction[] = [];
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        let currentPosition=currentPlayer.playerInGame.currentPosition;
        for (const node of destinationTile.path) {
            const delta = directionToVec2Map[node];
            currentPosition.x = currentPosition.x + delta.x;
            currentPosition.y = currentPosition.y + delta.y;

            actualPath.push(node);

            if (this.isPlayerOnIce(currentPosition, room) && this.hasPlayerTrippedOnIce()) {
                hasTripped = true;
                destinationTile.path = actualPath;
                destinationTile.position = currentPosition;
                break;
            }
        }
        return { optimalPath:destinationTile, hasTripped };
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.x][node.y] === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < SLIP_PROBABILITY;
    }

    updateCurrentPlayerPosition(node: Vec2, room: RoomGame, remainingMovement: number) {
        const roomToUpdate = room;
        const index = roomToUpdate.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        if (index !== -1) {
            roomToUpdate.players[index].playerInGame.currentPosition = node;
            roomToUpdate.players[index].playerInGame.remainingMovement = remainingMovement;
        }
    }
}
