import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { isAnotherPlayerPresentOnTile } from '@app/utils/utilities';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DoorOpeningService {
    constructor(private gameStatsService: GameStatsService) { }
    toggleDoor(room: RoomGame, doorPosition: Vec2): TileTerrain | undefined {
        const currentTerrain = room.game.map.mapArray[doorPosition.y][doorPosition.x];

        if (!isAnotherPlayerPresentOnTile(doorPosition, room.players)) {
            this.gameStatsService.processDoorToggleStats(room.game.stats, doorPosition);
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
