import { CreationMap, GameMode, ItemType, TileTerrain } from '@app/interfaces/map';
import { MapSize } from '@common/constants/game-map.constants';

export const MAP_CONTAINER_HEIGHT_FACTOR = 0.97;
export const MAP_CONTAINER_WIDTH_FACTOR = 0.5;
export const MOUSE_LEFT_CLICK_FLAG = 1;
export const MOUSE_RIGHT_CLICK_FLAG = 2;

export const ITEM_REMOVAL_BUFFER = 1;
export const MAP_NOT_FOUND_CODE = 404;

export const SCREENSHOT_SIZE = 256;
export const SCREENSHOT_FORMAT = 'image/jpeg';
export const SCREENSHOT_QUALITY = 0.4;

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
    { type: TileTerrain.ICE, label: 'Glace' },
    { type: TileTerrain.WATER, label: 'Eau' },
    { type: TileTerrain.CLOSEDDOOR, label: 'Porte' },
    { type: TileTerrain.WALL, label: 'Mur' },
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

export const SUCCESS_MESSAGE = 'Vous allez être redirigé à la fermeture de ce message';

export const DEFAULT_MAP: CreationMap = {
    size: MapSize.SMALL,
    mode: GameMode.CTF,
    name: '',
    description: '',
    mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
    placedItems: [],
    imageData: '',
};
