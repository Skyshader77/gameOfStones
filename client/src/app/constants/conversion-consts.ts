import { Item, TileTerrain } from '../interfaces/map';

export const itemToStringMap: { [key in Item]: string } = {
    [Item.BOOST1]: 'potionBlue',
    [Item.BOOST2]: 'potionGreen',
    [Item.BOOST3]: 'potionRed',
    [Item.BOOST4]: 'sword',
    [Item.BOOST5]: 'armor',
    [Item.BOOST6]: 'axe',
    [Item.RANDOM]: 'randomItem',
    [Item.START]: 'startPoint',
    [Item.FLAG]: 'flag',
    [Item.NONE]: '',
};

export const stringToItemMap: { [key: string]: Item } = {};
for (const [item, str] of Object.entries(itemToStringMap)) {
    stringToItemMap[str] = Number(item); // Convert item to number if it's an enum
}

export const terrainToStringMap: { [key in TileTerrain]: string } = {
    [TileTerrain.GRASS]: 'grass',
    [TileTerrain.ICE]: 'ice',
    [TileTerrain.WATER]: 'water',
    [TileTerrain.CLOSEDDOOR]: 'closed_door',
    [TileTerrain.WALL]: 'wall',
    [TileTerrain.OPENDOOR]: 'open_door',
};

export const stringToTerrainMap: { [key: string]: TileTerrain } = {};
for (const [terrain, str] of Object.entries(terrainToStringMap)) {
    stringToTerrainMap[str] = Number(terrain); // Convert terrain to number if it's an enum
}
