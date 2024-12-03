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
        console.log("List of items in map before pickup")
        this.map.placedItems.forEach((item)=>{console.log(item.type)});
        console.log("current number of items on map before picking up:"+this.map.placedItems.length)
        this.map.placedItems = this.map.placedItems.filter((item) => item.type !== itemType);
        console.log("current number of items on map after picking up:"+this.map.placedItems.length)
    }

    updateItemsAfterPlaced(item: Item) {
        this.map.placedItems = this.map.placedItems.filter((existingItem) => existingItem.type !== item.type);
        console.log("List of items in map before drop")
        this.map.placedItems.forEach((item)=>{console.log(item.type)});
        console.log("current number of items on map before dropping:"+this.map.placedItems.length)
        this.map.placedItems.push(JSON.parse(JSON.stringify(item)) as Item);
        console.log("current number of items on map after dropping:"+this.map.placedItems.length)
    }

    getMapSize(): number | undefined {
        return this.map?.size;
    }
}
