import { MapSize } from '@common/enums/map-size.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';

export interface RawMapData {
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    mapArray: TileTerrain[][];
    placedItems: RawItem[];
    imageData: string;
}

interface RawItem {
    position: {
        x: number;
        y: number;
    };
    type: ItemType;
}
