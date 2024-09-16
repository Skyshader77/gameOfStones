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

export enum GameMode {
    NORMAL,
    CTF,
}

export interface Tile {
    terrain: TileTerrain;
    item: Item;
}

export interface Map {
    mapId: string;
    name: string;
    description: string;
    rowSize: number;
    mode: GameMode;
    mapArray: Tile[][];
    placedItems: Item[];
    lastModification: Date;
}
