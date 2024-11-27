import { VirtualPlayerState } from '@app/interfaces/ai-state';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { getAdjacentPositions, isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DoorOpeningService {
    constructor(
        private gameStatsService: GameStatsService,
        private socketManagerService: SocketManagerService,
        private roomManagerService: RoomManagerService,
    ) {}
    toggleDoor(room: RoomGame, doorPosition: Vec2): TileTerrain | undefined {
        const currentTerrain = room.game.map.mapArray[doorPosition.y][doorPosition.x];
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        let newDoorState: TileTerrain;

        if (!isAnotherPlayerPresentOnTile(doorPosition, room.players)) {
            this.gameStatsService.processDoorToggleStats(room.game.stats, doorPosition);
            switch (currentTerrain) {
                case TileTerrain.ClosedDoor:
                    room.game.map.mapArray[doorPosition.y][doorPosition.x] = TileTerrain.OpenDoor;
                    newDoorState = TileTerrain.OpenDoor;
                    break;
                case TileTerrain.OpenDoor:
                    room.game.map.mapArray[doorPosition.y][doorPosition.x] = TileTerrain.ClosedDoor;
                    newDoorState = TileTerrain.ClosedDoor;
                    break;
            }
        }
        if (newDoorState) {
            currentPlayer.playerInGame.remainingActions--;
            server.to(room.room.roomCode).emit(GameEvents.ToggleDoor, { updatedTileTerrain: newDoorState, doorPosition });
            return newDoorState;
        }
        return undefined;
    }

    toggleDoorAI(room: RoomGame, virtualPlayer: Player, virtualPlayerState: VirtualPlayerState): void {
        const doorPosition = this.getDoorPosition(virtualPlayer.playerInGame.currentPosition, room);
        if (doorPosition) {
            this.toggleDoor(room, doorPosition);
            virtualPlayerState.isBeforeObstacle = false;
        }
    }

    private getDoorPosition(currentPlayerPosition: Vec2, room: RoomGame): Vec2 {
        const adjacentPositions = getAdjacentPositions(currentPlayerPosition);
        for (const position of adjacentPositions) {
            if (isCoordinateWithinBoundaries(position, room.game.map.mapArray)) {
                if (room.game.map.mapArray[position.y][position.x] === TileTerrain.ClosedDoor) {
                    return position;
                }
            }
        }
        return null;
    }
}
