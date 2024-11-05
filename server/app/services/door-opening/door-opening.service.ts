import { isAnotherPlayerPresentOnTile } from '@app/common/utilities';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DoorOpeningService {
    constructor(private roomManagerService: RoomManagerService) {}
    toggleDoor(doorPosition: Vec2, roomCode: string): TileTerrain | undefined {
        const room = this.roomManagerService.getRoom(roomCode);
        const currentTerrain = room.game.map.mapArray[doorPosition.y][doorPosition.x];

        if (!isAnotherPlayerPresentOnTile(doorPosition, room.players)) {
            switch (currentTerrain) {
                case TileTerrain.ClosedDoor:
                    room.game.map.mapArray[doorPosition.y][doorPosition.x] = TileTerrain.OpenDoor;
                    return TileTerrain.OpenDoor;
                case TileTerrain.OpenDoor:
                    room.game.map.mapArray[doorPosition.y][doorPosition.x] = TileTerrain.ClosedDoor;
                    return TileTerrain.ClosedDoor;
            }
        }
        return undefined;
    }
}
