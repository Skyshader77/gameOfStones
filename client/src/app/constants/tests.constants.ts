import { GameMode, Item, Map, MapSize, Tile, TileTerrain } from '@app/interfaces/map';
export const mockMaps: Map[] = [
    {
        _id: 'Su27FLanker',
        name: 'Game of Drones',
        description: 'Test Map 1',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        mapArray: generateMapArray(MapSize.SMALL, TileTerrain.GRASS),
        placedItems: [Item.BOOST3, Item.BOOST2],
        isVisible: false,
    },
    {
        _id: 'F35jsf',
        name: 'Engineers of War',
        description: 'Test Map 2',
        size: MapSize.MEDIUM,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1997 03:24:00'),
        mapArray: generateMapArray(MapSize.SMALL, TileTerrain.GRASS),
        placedItems: [],
        isVisible: true,
    },
    {
        _id: 'Su27FLanker',
        name: 'Game of Thrones',
        description: 'Test Map 2.5',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1998 03:24:00'),
        mapArray: generateMapArray(MapSize.SMALL, TileTerrain.GRASS),
        placedItems: [Item.BOOST3, Item.BOOST6, Item.BOOST4],
        isVisible: false,
    },
];

export const mockNewMap: Map = {
    _id: 'Su27FLanker',
    name: 'NewMapTest',
    description: 'Test Map 3',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: generateMapArray(MapSize.SMALL, TileTerrain.WATER),
    placedItems: [],
    isVisible: false,
    dateOfLastModification: new Date(),
};

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
