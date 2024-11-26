import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { isAnotherPlayerPresentOnTile } from '@app/utils/utilities';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
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
            server.to(room.room.roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newDoorState, doorPosition });
            return newDoorState;
        }
        return undefined;
    }
}
