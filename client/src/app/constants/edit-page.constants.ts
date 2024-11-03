import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap } from '@common/interfaces/map';

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
    { type: TileTerrain.Ice, label: 'Glace' },
    { type: TileTerrain.Water, label: 'Eau' },
    { type: TileTerrain.ClosedDoor, label: 'Porte' },
    { type: TileTerrain.Wall, label: 'Mur' },
];

export const TILE_DESCRIPTIONS: Record<TileTerrain, string> = {
    [TileTerrain.GRASS]: 'Miam du bon gazon.',
    [TileTerrain.WATER]: 'Coûte un point de mouvement supplémentaire.',
    [TileTerrain.WALL]: 'Ne peut pas être franchi.',
    [TileTerrain.ICE]: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    [TileTerrain.CLOSEDDOOR]: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
    [TileTerrain.OPENDOOR]: 'Comme closed door, mais open door.',
};

export const ITEM_DESCRIPTIONS: Record<ItemType, string> = {
    [ItemType.BOOST1]: 'Une potion pour devenir bleu.',
    [ItemType.BOOST2]: 'Une potion pour devenir vert.',
    [ItemType.BOOST3]: 'Une potion pour devenir rouge.',
    [ItemType.BOOST4]: 'Une épée ancienne permettant une puissance incomparable.',
    [ItemType.BOOST5]: 'Une armure imbrisable pour survivre à tous les coups.',
    [ItemType.BOOST6]: 'Une hache barbarique pour détruire les murs.',
    [ItemType.RANDOM]: 'Cet item correspond à un item aléatoire parmi ceux non utilisés.',
    [ItemType.START]: 'Point de départ pour un des joueurs.',
    [ItemType.FLAG]: 'Ramener le drapeau à son point de départ permet de remporter la partie.',
    [ItemType.NONE]: 'Rien du tout. Completement rien du tout.',
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
    mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.Grass)),
    placedItems: [],
    imageData: '',
};
