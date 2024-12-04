import { Injectable } from '@angular/core';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Tile } from '@common/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapUtilService {
    *mapIterator(mapArray: TileTerrain[][]): Generator<Tile> {
        for (let i = 0; i < mapArray.length; i++) {
            for (let j = 0; j < mapArray[i].length; j++) {
                yield { tileTerrain: mapArray[i][j], position: { x: j, y: i } };
            }
        }
    }
}
