import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { BLANK_MAP } from '@common/constants/game-map.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class GameMapService {
    map: Map;
    mapPixelDimension: number;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.map = BLANK_MAP;
        this.mapPixelDimension = MAP_PIXEL_DIMENSION;
    }

    getTileDimension(): number {
        return this.mapPixelDimension / this.map.size;
    }

    updateDoorState(tileTerrain: TileTerrain, doorPosition: Vec2) {
        this.map.mapArray[doorPosition.y][doorPosition.x] = tileTerrain;
    }

    updateItemsAfterPickup(itemType: ItemType) {
        this.map.placedItems = this.map.placedItems.filter((item) => {
            return item.type !== itemType;
        });
    }

    updateItemsAfterDrop(item: Item) {
        this.map.placedItems.push(JSON.parse(JSON.stringify(item)) as Item);
    }

    getMapSize(): number | undefined {
        return this.map?.size;
    }
}
