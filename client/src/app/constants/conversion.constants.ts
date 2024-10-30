import { Direction } from '@common/interfaces/move';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';

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

export const directionToVec2Map: { [key in Direction]: Vec2 } = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT]: { x: -1, y: 0 },
    [Direction.RIGHT]: { x: 1, y: 0 },
};

export const STRING_TO_TERRAIN_MAP: { [key: string]: TileTerrain } = {};
for (const [terrain, str] of Object.entries(TERRAIN_TO_STRING_MAP)) {
    STRING_TO_TERRAIN_MAP[str] = Number(terrain);
}
