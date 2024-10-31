import { ItemType, TileTerrain } from '@app/interfaces/map';

export const ITEM_TO_STRING_MAP: { [key in ItemType]: string } = {
    [ItemType.BOOST1]: 'potion-blue',
    [ItemType.BOOST2]: 'potion-green',
    [ItemType.BOOST3]: 'potion-red',
    [ItemType.BOOST4]: 'sword',
    [ItemType.BOOST5]: 'armor',
    [ItemType.BOOST6]: 'axe',
    [ItemType.RANDOM]: 'random-item',
    [ItemType.START]: 'start-point',
    [ItemType.FLAG]: 'flag',
    [ItemType.NONE]: '',
};

export const STRING_TO_ITEM_MAP: { [key: string]: ItemType } = {};
for (const [item, str] of Object.entries(ITEM_TO_STRING_MAP)) {
    STRING_TO_ITEM_MAP[str] = Number(item);
}

export const TERRAIN_TO_STRING_MAP: { [key in TileTerrain]: string } = {
    [TileTerrain.GRASS]: 'grass',
    [TileTerrain.ICE]: 'ice',
    [TileTerrain.WATER]: 'water',
    [TileTerrain.CLOSEDDOOR]: 'closed-door',
    [TileTerrain.WALL]: 'wall',
    [TileTerrain.OPENDOOR]: 'open-door',
};

export const STRING_TO_TERRAIN_MAP: { [key: string]: TileTerrain } = {};
for (const [terrain, str] of Object.entries(TERRAIN_TO_STRING_MAP)) {
    STRING_TO_TERRAIN_MAP[str] = Number(terrain);
}
