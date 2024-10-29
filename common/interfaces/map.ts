import { MapSize } from '../enums/map-size.enum';
import { GameMode } from '../enums/game-mode.enum';
import { TileTerrain } from '../enums/tile-terrain.enum';
import { Item } from './item';

export interface Map {
    _id: string;
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    mapArray: TileTerrain[][];
    placedItems: Item[];
    isVisible: boolean;
    dateOfLastModification: Date;
    imageData: string;
}

export interface CreationMap {
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    mapArray: TileTerrain[][];
    placedItems: Item[];
    imageData: string;
}
