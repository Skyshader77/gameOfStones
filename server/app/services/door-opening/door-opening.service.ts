import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';

@Injectable()
export class DoorOpeningService {
    constructor(
        private gameStatsService: GameStatsService,
        private socketManagerService: SocketManagerService,
        private roomManagerService: RoomManagerService,
        private virtualPlayerStateService: VirtualPlayerStateService,
    ) {}

    toggleDoor(room: RoomGame, doorPosition: Vec2): TileTerrain | null {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        let newDoorState: TileTerrain = null;

        if (!isAnotherPlayerPresentOnTile(doorPosition, room.players)) {
            this.gameStatsService.processDoorToggleStats(room.game.stats, doorPosition);
            newDoorState = this.modifyDoor(room.game.map, doorPosition);
            if (newDoorState) {
                if (!isPlayerHuman(currentPlayer)) {
                    this.virtualPlayerStateService.handleDoor(room, newDoorState);
                }
                currentPlayer.playerInGame.remainingActions--;
                server.to(room.room.roomCode).emit(GameEvents.ToggleDoor, { updatedTileTerrain: newDoorState, doorPosition });
                room.game.hasPendingAction = true;
            }
        }

        return newDoorState;
    }

    isTileDoor(tile: TileTerrain) {
        return tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor;
    }

    private modifyDoor(map: Map, doorPosition: Vec2): TileTerrain | null {
        const door = map.mapArray[doorPosition.y][doorPosition.x];
        if (!this.isTileDoor(door)) return null;
        const newDoor = door === TileTerrain.OpenDoor ? TileTerrain.ClosedDoor : TileTerrain.OpenDoor;
        map.mapArray[doorPosition.y][doorPosition.x] = newDoor;

        return newDoor;
    }
}
