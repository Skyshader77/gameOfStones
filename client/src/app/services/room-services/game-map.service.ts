import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { BLANK_MAP } from '@common/constants/game-map.constants';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class GameMapService {
    map: Map = BLANK_MAP;
    mapPixelDimension = MAP_PIXEL_DIMENSION;

    getTileDimension(): number {
        return this.mapPixelDimension / this.map.size;
    }

    updateDoorState(tileTerrain: TileTerrain, doorPosition: Vec2) {
        this.map.mapArray[doorPosition.y][doorPosition.x] = tileTerrain;
    }

    getMapSize(): number | undefined {
        return this.map?.size;
    }
}
