import { ItemType, TileTerrain } from '@app/interfaces/map';
import { Direction } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@common/interfaces/vec2';

export const ITEM_TO_STRING_MAP: { [key in ItemType]: string } = {
    [ItemType.BOOST1]: 'potionBlue',
    [ItemType.BOOST2]: 'potionGreen',
    [ItemType.BOOST3]: 'potionRed',
    [ItemType.BOOST4]: 'sword',
    [ItemType.BOOST5]: 'armor',
    [ItemType.BOOST6]: 'axe',
    [ItemType.RANDOM]: 'randomItem',
    [ItemType.START]: 'startPoint',
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
    [TileTerrain.CLOSEDDOOR]: 'closed_door',
    [TileTerrain.WALL]: 'wall',
    [TileTerrain.OPENDOOR]: 'open_door',
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
