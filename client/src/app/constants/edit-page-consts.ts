import { Item } from '@app/interfaces/map';

export const MAP_CONTAINER_HEIGHT_FACTOR = 0.97;
export const MOUSE_LEFT_CLICK_FLAG = 1;
export const MOUSE_RIGHT_CLICK_FLAG = 2;

export const SMALL_MAP_SIZE = 10;
export const MEDIUM_MAP_SIZE = 15;
export const LARGE_MAP_SIZE = 20;

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
