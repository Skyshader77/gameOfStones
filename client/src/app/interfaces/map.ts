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

export enum MapSize {
    SMALL = 10,
    MEDIUM = 15,
    LARGE = 20,
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
}

export interface MapCreate {
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    mapArray: Tile[][];
    placedItems: Item[];
}

export function generateMapArray(mapNumbRows: number, tileType: TileTerrain): Tile[][] {
    const mapArray: Tile[][] = [];

    for (let row = 0; row < mapNumbRows; row++) {
        const tileRow: Tile[] = [];
        for (let col = 0; col < mapNumbRows; col++) {
            const tile: Tile = {
                terrain: tileType,
                item: Item.NONE,
            };
            tileRow.push(tile);
        }
        mapArray.push(tileRow);
    }

    return mapArray;
}
