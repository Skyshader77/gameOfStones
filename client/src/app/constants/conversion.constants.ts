import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { SPRITE_FILE_EXTENSION } from './rendering.constants';

export const ITEM_FOLDER = 'assets/items/';

export type ItemStringMap = {
    [key in ItemType]: string;
};

export const ITEM_TO_STRING_MAP: ItemStringMap = {
    [ItemType.BismuthShield]: 'bismuth-shield',
    [ItemType.GlassStone]: 'glass-stone',
    [ItemType.QuartzSkates]: 'potion-blue',
    [ItemType.SapphireFins]: 'potion-red',
    [ItemType.GeodeBomb]: 'geode-bomb',
    [ItemType.GraniteHammer]: 'granite-hammer',
    [ItemType.Random]: 'random-item',
    [ItemType.Start]: 'start-point',
    [ItemType.Flag]: 'light-stone',
};

export const ITEM_PATHS: { [key in ItemType]: string } = {
    [ItemType.BismuthShield]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.BismuthShield] + SPRITE_FILE_EXTENSION,
    [ItemType.GlassStone]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GlassStone] + SPRITE_FILE_EXTENSION,
    [ItemType.QuartzSkates]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.QuartzSkates] + SPRITE_FILE_EXTENSION,
    [ItemType.SapphireFins]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.SapphireFins] + SPRITE_FILE_EXTENSION,
    [ItemType.GeodeBomb]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GeodeBomb] + SPRITE_FILE_EXTENSION,
    [ItemType.GraniteHammer]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.GraniteHammer] + SPRITE_FILE_EXTENSION,
    [ItemType.Random]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Random] + SPRITE_FILE_EXTENSION,
    [ItemType.Start]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Start] + SPRITE_FILE_EXTENSION,
    [ItemType.Flag]: ITEM_FOLDER + ITEM_TO_STRING_MAP[ItemType.Flag] + SPRITE_FILE_EXTENSION,
};

export const TILE_FOLDER = 'assets/tiles/';

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

export const TILE_PATHS: { [key in TileTerrain]: string } = {
    [TileTerrain.ClosedDoor]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.ClosedDoor] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Grass]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Grass] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Ice]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Ice] + SPRITE_FILE_EXTENSION,
    [TileTerrain.OpenDoor]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.OpenDoor] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Wall]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Wall] + SPRITE_FILE_EXTENSION,
    [TileTerrain.Water]: TILE_FOLDER + TERRAIN_TO_STRING_MAP[TileTerrain.Water] + SPRITE_FILE_EXTENSION,
};

export type StringToItemMap = {
    [key: string]: ItemType;
};

export const STRING_TO_ITEM_MAP: StringToItemMap = {};
for (const [item, str] of Object.entries(ITEM_TO_STRING_MAP)) {
    STRING_TO_ITEM_MAP[str] = Number(item);
}

export const TERRAIN_MAP = new Map([
    ['grass', 'Herbe'],
    ['ice', 'Glace'],
    ['water', 'Eau'],
    ['closed-door', 'Porte fermée'],
    ['wall', 'Mur'],
    ['open-door', 'Porte ouverte'],
]);

export const NO_MOVEMENT_COST_TERRAINS = new Set(['wall', 'closed-door']);
export const UNKNOWN_TEXT = 'Inconnu';
