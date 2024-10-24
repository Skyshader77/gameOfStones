import { Item, TileTerrain } from '@app/interfaces/map';
import { Direction } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@common/interfaces/vec2';

export const ITEM_TO_STRING_MAP: { [key in Item]: string } = {
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

export const STRING_TO_ITEM_MAP: { [key: string]: Item } = {};
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
