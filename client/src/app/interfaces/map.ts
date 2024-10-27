import { Vec2 } from '@common/interfaces/vec2';
import { MapSize } from '@common/constants/game-map.constants';

export enum TileTerrain {
    GRASS,
    WALL,
    ICE,
    WATER,
    OPENDOOR,
    CLOSEDDOOR,
}

export enum ItemType {
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

export enum GameMode {
    NORMAL,
    CTF,
}

export interface Item {
    position: Vec2;
    type: ItemType;
}

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

export interface MapMouseEvent {
    tilePosition: Vec2;
}
