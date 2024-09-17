import { Injectable } from '@angular/core';
import { Item, TileTerrain } from '@app/interfaces/map';
import { itemToStringMap, stringToItemMap, stringToTerrainMap, terrainToStringMap } from '../constants/conversion-consts';
@Injectable({
    providedIn: 'root',
})
export class DataConversionService {
    constructor() {}

    // Conversion functions
    convertStringToItem(str: string): Item {
        return stringToItemMap[str] || Item.NONE;
    }

    convertItemToString(item: Item): string {
        return itemToStringMap[item] || '';
    }

    convertTerrainToString(terrain: TileTerrain): string {
        return terrainToStringMap[terrain] || '';
    }

    convertStringToTerrain(str: string): TileTerrain {
        return stringToTerrainMap[str] || TileTerrain.GRASS;
    }
}
