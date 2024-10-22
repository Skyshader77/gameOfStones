import { Vec2 } from '@app/interfaces/vec2';

export enum TileTerrain {
    GRASS,
    WALL,
    ICE,
    WATER,
    OPENDOOR,
    CLOSEDDOOR,
}

export enum Item {
    BOOST1,
    BOOST2,
    BOOST3,
    BOOST4,
    BOOST5,
    BOOST6,
    RANDOM,
    START,
    FLAG,
    NONE,
}

export enum MapSize {
    SMALL = 10,
    MEDIUM = 15,
    LARGE = 20,
}

export enum GameMode {
    NORMAL,
    CTF,
}

export interface Tile {
    terrain: TileTerrain;
    item: Item;
}

export interface Map {
    _id: string;
    name: string;
    description: string;

    size: MapSize;
    mode: GameMode;
    mapArray: Tile[][];
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
    mapArray: Tile[][];
    placedItems: Item[];
    imageData: string;
}

export interface MapMouseEvent {
    tilePosition: Vec2;
}
