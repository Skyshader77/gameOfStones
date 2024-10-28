import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DoorOpeningService {
    constructor(private roomManagerService: RoomManagerService) {}
    toggleDoor(doorPosition: Vec2, roomCode: string): TileTerrain | undefined {
        const room = this.roomManagerService.getRoom(roomCode);
        const currentTerrain = room.game.map.mapArray[doorPosition.x][doorPosition.y];

        switch (currentTerrain) {
            case TileTerrain.CLOSEDDOOR:
                room.game.map.mapArray[doorPosition.x][doorPosition.y] = TileTerrain.OPENDOOR;
                this.updateRoom(room);
                return TileTerrain.OPENDOOR;

            case TileTerrain.OPENDOOR:
                room.game.map.mapArray[doorPosition.x][doorPosition.y] = TileTerrain.CLOSEDDOOR;
                this.updateRoom(room);
                return TileTerrain.CLOSEDDOOR;

            default:
                return undefined;
        }
    }

    updateRoom(room: RoomGame) {
        this.roomManagerService.updateRoom(room.room.roomCode, room);
    }
}
