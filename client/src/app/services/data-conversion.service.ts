import { Injectable } from '@angular/core';
import { itemToStringMap, stringToItemMap, stringToTerrainMap, terrainToStringMap } from '@app/constants/conversion-consts';
import { Item, TileTerrain } from '@app/interfaces/map';
@Injectable({
    providedIn: 'root',
})
export class DataConversionService {
    // Conversion functions
    convertStringToItem(str: string): Item {
        return stringToItemMap[str];
    }

    convertItemToString(item: Item): string {
        return itemToStringMap[item];
    }

    convertTerrainToString(terrain: TileTerrain): string {
        return terrainToStringMap[terrain];
    }

    convertStringToTerrain(str: string): TileTerrain {
        return stringToTerrainMap[str];
    }
}
