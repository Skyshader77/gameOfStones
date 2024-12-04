import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

export type ItemStringMap = {
    [key in ItemType]: string;
};

export const ITEM_TO_STRING_MAP: ItemStringMap = {
    [ItemType.BismuthShield]: 'bismuth-shield',
    [ItemType.GlassStone]: 'glass-stone',
    [ItemType.QuartzSkates]: 'quartz-skates',
    [ItemType.SapphireFins]: 'sapphire-fins',
    [ItemType.GeodeBomb]: 'geode-bomb',
    [ItemType.GraniteHammer]: 'granite-hammer',
    [ItemType.Random]: 'random-item',
    [ItemType.Start]: 'flame',
    [ItemType.Flag]: 'light-stone',
};

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

export type ModeToDescription = {
    [key: string]: string;
};
export const MODE_DESCRIPTIONS: ModeToDescription = {
    ['Classique']: 'Affrontez vos ennemis dans une série de combats et remporte 3 victoires pour assurer votre gloire',
    ['Course à la Lumière']: 'Capturez la pierre de lumière et ramenez-la à votre base avant vos ennemis pour remporter la partie.',
};
