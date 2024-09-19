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

export enum MapSize {
    SMALL = 10,
    MEDIUM = 15,
    LARGE = 20,
}

export interface EditionMap {
    mapId: string;
    name: string;
    description: string;
    rowSize: MapSize;
    mode: GameMode;
    mapArray: Tile[];
    lastModification: Date;
}

export interface Map {
    _id: string;
    name: string;
    mapDescription: string;
    sizeRow: MapSize;
    mode: GameMode;
    mapArray: Tile[];
    isVisible: boolean;
    // TODO players in map?
    dateOfLastModification: Date;
}

export interface MapCreate {
    name: string;
    mapDescription: string;
    sizeRow: MapSize;
    mode: GameMode;
    mapArray: Tile[];
}

export function generateMapArray(mapNumbRows: number, tileType: TileTerrain): Tile[] {
    const mapArray: Tile[] = [];

    for (let i = 0; i < mapNumbRows * mapNumbRows; i++) {
        const tile: Tile = {
            terrain: tileType,
            item: Item.NONE,
        };
        mapArray.push(tile);
    }

    return mapArray;
}
