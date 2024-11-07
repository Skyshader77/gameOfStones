import { Injectable } from '@angular/core';
import { Map } from '@common/interfaces/map';
import { MapSize } from '@common/enums/map-size.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';


@Injectable({
  providedIn: 'root'
})
export class MapExportService {

  constructor() { }

  exportMap(map: Map) {
    
    for (const item of map.placedItems) {
      console.log("Type: " + item.type + " Position: x: " + item.position.x + " y: " + item.position.y);
    }
    console.log("Exporting map " + map.placedItems + " from Export service");
    let mapObject = this.convertMapToJson(map);
    console.log("Converted map " + mapObject);
  }

  convertMapToJson(map: Map): string {
    return JSON.stringify(map, this.replacer);
  }

  private replacer(key: string, value: any) {
    if (key === 'isVisible' || key === '__v' || key === 'TILE_COSTS') {
      return undefined;
    }

    if (key === 'placedItems') return 'Item List';
    
    if (value === MapSize.Small) return 'Small';
    if (value === MapSize.Medium) return 'Medium';
    if (value === MapSize.Large) return 'Large';

    if (value === GameMode.Normal) return 'Normal';
    if (value === GameMode.CTF) return 'CTF';

    if (Object.values(TileTerrain).includes(value)) {
      return TileTerrain[value];
    }

    if (Object.values(ItemType).includes(value)) {
      return ItemType[value];
    }

    if (value && value.x !== undefined && value.y !== undefined) {
      return { x: value.x, y: value.y };
    }

    return value;
  }
}
