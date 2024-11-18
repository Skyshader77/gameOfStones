import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

export const ITEM_FOLDER = 'assets/items/';

export const ITEM_PATHS: { [key in ItemType]: string } = {
    [ItemType.Boost1]: ITEM_FOLDER + 'potion-blue.png',
    [ItemType.Boost2]: ITEM_FOLDER + 'potion-green.png',
    [ItemType.Boost3]: ITEM_FOLDER + 'potion-red.png',
    [ItemType.Boost4]: ITEM_FOLDER + 'sword.png',
    [ItemType.Boost5]: ITEM_FOLDER + 'armor.png',
    [ItemType.Boost6]: ITEM_FOLDER + 'axe.png',
    [ItemType.Random]: ITEM_FOLDER + 'random-item.png',
    [ItemType.Start]: ITEM_FOLDER + 'start-point.png',
    [ItemType.Flag]: ITEM_FOLDER + 'flag.png',
};

export const TILE_FOLDER = 'assets/tiles/';

export const TILE_PATHS: { [key in TileTerrain]: string } = {
    [TileTerrain.ClosedDoor]: TILE_FOLDER + 'closed-door.png',
    [TileTerrain.Grass]: TILE_FOLDER + 'grass.png',
    [TileTerrain.Ice]: TILE_FOLDER + 'ice.png',
    [TileTerrain.OpenDoor]: TILE_FOLDER + 'open-door.png',
    [TileTerrain.Wall]: TILE_FOLDER + 'wall.png',
    [TileTerrain.Water]: TILE_FOLDER + 'water.png',
};

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
