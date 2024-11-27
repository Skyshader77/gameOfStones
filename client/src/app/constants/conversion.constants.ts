import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

export const ITEM_FOLDER = 'assets/items/';

export const ITEM_PATHS: { [key in ItemType]: string } = {
    [ItemType.BismuthShield]: ITEM_FOLDER + 'potion-blue.png',
    [ItemType.GlassStone]: ITEM_FOLDER + 'potion-green.png',
    [ItemType.QuartzSkates]: ITEM_FOLDER + 'potion-red.png',
    [ItemType.SapphireFins]: ITEM_FOLDER + 'sword.png',
    [ItemType.GeodeBomb]: ITEM_FOLDER + 'armor.png',
    [ItemType.GraniteHammer]: ITEM_FOLDER + 'axe.png',
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
    [ItemType.BismuthShield]: 'potion-blue',
    [ItemType.GlassStone]: 'potion-green',
    [ItemType.QuartzSkates]: 'potion-red',
    [ItemType.SapphireFins]: 'sword',
    [ItemType.GeodeBomb]: 'armor',
    [ItemType.GraniteHammer]: 'axe',
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
