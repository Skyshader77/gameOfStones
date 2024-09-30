import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';

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
    wall: 'Ne peut pas être franchi.',
    ice: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    closed_door: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
};

export const ITEM_DESCRIPTIONS: { [key: string]: string } = {
    potionBlue: 'Une potion pour devenir bleu.',
    potionGreen: 'Une potion pour devenir vert.',
    potionRed: 'Une potion pour devenir rouge.',
    sword: 'Une épée ancienne permettant une puissance incomparable.',
    armor: 'Une armure imbrisable pour survivre à tous les coups.',
    axe: 'Une hache barbarique pour détruire les murs.',
    randomItem: 'Cet item correspond à un item aléatoire parmi ceux non utilisés.',
    startPoint: 'Point de départ pour un des joueurs.',
    flag: 'Ramener le drapeau à son point de départ permet de remporter la partie.',
};

export const DEFAULT_MAP: CreationMap = {
    size: MapSize.SMALL,
    mode: GameMode.CTF,
    name: '',
    description: '',
    mapArray: Array.from({ length: MapSize.SMALL }, () =>
        Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
    ),
    placedItems: [],
    imageData: '',
};
