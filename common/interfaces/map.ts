import { GameMode } from '../enums/game-mode.enum';
import { MapSize } from '../enums/map-size.enum';
import { TileTerrain } from '../enums/tile-terrain.enum';
import { Item } from './item';
import { Vec2 } from './vec2';

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


export interface DoorOpeningOutput {
    updatedTileTerrain: TileTerrain;
    doorPosition: Vec2;
}

export interface TileInfo {
    tileTerrainName: string;
    cost: number;
}

export interface Tile {
    tileTerrain: TileTerrain;
    position: Vec2;
}
