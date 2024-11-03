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
    map: Map | null = BLANK_MAP;

    getTileDimension(): number {
        return this.map !== null ? MAP_PIXEL_DIMENSION / this.map?.size : 0;
    }

    updateDoorState(tileTerrain: TileTerrain, doorPosition: Vec2) {
        if (this.map) {
            this.map.mapArray[doorPosition.y][doorPosition.x] = tileTerrain;
        }
    }
}
