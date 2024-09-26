import { Item } from '@app/interfaces/map';

export const MAP_CONTAINER_HEIGHT_FACTOR = 0.97;
export const MOUSE_LEFT_CLICK_FLAG = 1;
export const MOUSE_RIGHT_CLICK_FLAG = 2;

export const SMALL_MAP_ITEM_LIMIT = 2;
export const MEDIUM_MAP_ITEM_LIMIT = 4;
export const LARGE_MAP_ITEM_LIMIT = 6;
export const ITEM_REMOVAL_BUFFER = 1;
export const MAP_NOT_FOUND_CODE = 404;

export const SIDEBAR_ITEMS = [
    { type: Item.BOOST1, label: 'Potion Bleue' },
    { type: Item.BOOST2, label: 'Potion Verte' },
    { type: Item.BOOST3, label: 'Potion Rouge' },
    { type: Item.BOOST4, label: 'Épée' },
    { type: Item.BOOST5, label: 'Armure' },
    { type: Item.BOOST6, label: 'Hache' },
    { type: Item.RANDOM, label: 'Item Aléatoire' },
    { type: Item.START, label: 'Point de départ' },
    { type: Item.FLAG, label: 'Drapeau' },
];

export const SIDEBAR_TILES = [
    { type: 'ice', label: 'Glace' },
    { type: 'water', label: 'Eau' },
    { type: 'closed_door', label: 'Porte' },
    { type: 'wall', label: 'Mur' },
];

export const TILE_DESCRIPTIONS: { [key: string]: string } = {
    water: 'Coûte un point de mouvement supplémentaire.',
    wall: 'Ne peut pas ête franchi.',
    ice: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    closed_door: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
};

export const ITEM_DESCRIPTIONS: { [key: string]: string } = {
    potionBlue: 'Coûte un point de mouvement supplémentaire.',
    potionGreen: 'Ne peut pas ête franchi.',
    potionRed: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    sword: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
    armor: 'oups',
    axe: 'tchamp was here',
    randomItem: 'COOSSY was here',
    startPoint: 'NO was here',
    flag: 'baba G',
};
