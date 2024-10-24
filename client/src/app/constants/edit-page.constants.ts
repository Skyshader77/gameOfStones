import { CreationMap, GameMode, ItemType, MapSize, TileTerrain } from '@app/interfaces/map';

export const MAP_CONTAINER_HEIGHT_FACTOR = 0.97;
export const MAP_CONTAINER_WIDTH_FACTOR = 0.5;
export const MOUSE_LEFT_CLICK_FLAG = 1;
export const MOUSE_RIGHT_CLICK_FLAG = 2;

export const SMALL_MAP_ITEM_LIMIT = 2;
export const MEDIUM_MAP_ITEM_LIMIT = 4;
export const LARGE_MAP_ITEM_LIMIT = 6;
export const ITEM_REMOVAL_BUFFER = 1;
export const MAP_NOT_FOUND_CODE = 404;

export const SCREENSHOT_SIZE = 512;

export const PREVIEW_IMAGE_QUALITY = 0.4;

export const SIDEBAR_ITEMS = [
    { type: ItemType.BOOST1, label: 'Potion Bleue' },
    { type: ItemType.BOOST2, label: 'Potion Verte' },
    { type: ItemType.BOOST3, label: 'Potion Rouge' },
    { type: ItemType.BOOST4, label: 'Épée' },
    { type: ItemType.BOOST5, label: 'Armure' },
    { type: ItemType.BOOST6, label: 'Hache' },
    { type: ItemType.RANDOM, label: 'Item Aléatoire' },
    { type: ItemType.START, label: 'Point de départ' },
    { type: ItemType.FLAG, label: 'Drapeau' },
];

export const SIDEBAR_TILES = [
    { type: 'ice', label: 'Glace' },
    { type: 'water', label: 'Eau' },
    { type: 'closedDoor', label: 'Porte' },
    { type: 'wall', label: 'Mur' },
];

export const TILE_DESCRIPTIONS: { [key: string]: string } = {
    water: 'Coûte un point de mouvement supplémentaire.',
    wall: 'Ne peut pas être franchi.',
    ice: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    closedDoor: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
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

export const VALIDATION_ERRORS = {
    doorAndWallNumberValid: 'Il y a trop de murs et de portes sur la carte.',
    wholeMapAccessible: 'Certaines parties de la carte sont inaccessibles dû à un agencement de murs.',
    allStartPointsPlaced: "Certains points de départ n'ont pas été placés.",
    doorSurroundingsValid: "L'encadrement de certaines portes est invalide.",
    allItemsPlaced: "Le nombre d'objets placés est invalide.",
    flagPlaced: "Le drapeau n'a pas été placé.",
    nameValid: 'Le nom est invalide.',
    descriptionValid: 'La description est invalide.',
};

export const CREATION_EDITION_ERROR_TITLES = {
    invalid: 'La carte est invalide !',
    creation: 'La carte a été enregistrée !',
    edition: 'La carte a été mise à jour !',
};

export const DEFAULT_MAP: CreationMap = {
    size: MapSize.SMALL,
    mode: GameMode.CTF,
    name: '',
    description: '',
    mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
    placedItems: [],
    imageData: '',
};

export const MAP_ITEM_LIMIT = {
    [MapSize.SMALL]: SMALL_MAP_ITEM_LIMIT,
    [MapSize.MEDIUM]: MEDIUM_MAP_ITEM_LIMIT,
    [MapSize.LARGE]: LARGE_MAP_ITEM_LIMIT,
};
