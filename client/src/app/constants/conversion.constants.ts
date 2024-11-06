import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

export type ItemStringMap = {
    [key in ItemType]: string;
};

export const ITEM_TO_STRING_MAP: ItemStringMap = {
    [ItemType.Boost1]: 'potion-blue',
    [ItemType.Boost2]: 'potion-green',
    [ItemType.Boost3]: 'potion-red',
    [ItemType.Boost4]: 'sword',
    [ItemType.Boost5]: 'armor',
    [ItemType.Boost6]: 'axe',
    [ItemType.Random]: 'random-item',
    [ItemType.Start]: 'start-point',
    [ItemType.Flag]: 'flag',
    [ItemType.None]: '',
};

export type StringToItemMap = {
    [key: string]: ItemType;
};

export const STRING_TO_ITEM_MAP: StringToItemMap = {};
for (const [item, str] of Object.entries(ITEM_TO_STRING_MAP)) {
    STRING_TO_ITEM_MAP[str] = Number(item);
}

export type TerrainStringMap = {
    [key in TileTerrain]: string;
};

export const TERRAIN_TO_STRING_MAP: TerrainStringMap = {
    [TileTerrain.Grass]: 'grass',
    [TileTerrain.Ice]: 'ice',
    [TileTerrain.Water]: 'water',
    [TileTerrain.ClosedDoor]: 'closed-door',
    [TileTerrain.Wall]: 'wall',
    [TileTerrain.OpenDoor]: 'open-door',
};

export type StringToTerrainMap = {
    [key: string]: TileTerrain;
};

export const STRING_TO_TERRAIN_MAP: StringToTerrainMap = {};
for (const [terrain, str] of Object.entries(TERRAIN_TO_STRING_MAP)) {
    STRING_TO_TERRAIN_MAP[str] = Number(terrain);
}
