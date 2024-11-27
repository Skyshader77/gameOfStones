import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap } from '@common/interfaces/map';

export const RADIX = 10;

export const ITEM_ID = { randomItem: 6, startPoint: 7, flag: 8 };

export const MAP_CONTAINER_HEIGHT_FACTOR = 0.97;
export const MAP_CONTAINER_WIDTH_FACTOR = 0.5;
export const MOUSE_LEFT_CLICK_FLAG = 1;
export const MOUSE_RIGHT_CLICK_FLAG = 2;
export const ITEM_HOVER_POSITION = 'absolute';

export const ITEM_REMOVAL_BUFFER = 1;
export const MAP_NOT_FOUND_CODE = 404;

export const SCREENSHOT_SIZE = 256;
export const SCREENSHOT_FORMAT = 'image/jpeg';
export const SCREENSHOT_QUALITY = 0.4;

export const SIDEBAR_TILES = [
    { type: TileTerrain.Ice, label: 'Glace' },
    { type: TileTerrain.Water, label: 'Eau' },
    { type: TileTerrain.ClosedDoor, label: 'Porte' },
    { type: TileTerrain.Wall, label: 'Mur' },
];

type TileDescriptionMap = Record<TileTerrain, string>;

export const TILE_DESCRIPTIONS: TileDescriptionMap = {
    [TileTerrain.Grass]: 'Miam du bon gazon.',
    [TileTerrain.Water]: 'Coûte un point de mouvement supplémentaire.',
    [TileTerrain.Wall]: 'Ne peut pas être franchi.',
    [TileTerrain.Ice]: 'Aucun coût de mouvement, mais il y a une chance de glisser...',
    [TileTerrain.ClosedDoor]: 'Peut être ouverte ou fermée. Interagir avec coûte une action.',
    [TileTerrain.OpenDoor]: 'Comme closed door, mais open door.',
};

type ItemDescriptionMap = Record<ItemType, string>;

export const ITEM_DESCRIPTIONS: ItemDescriptionMap = {
    [ItemType.BismuthShield]: 'Une potion pour devenir bleu.',
    [ItemType.GlassStone]: 'Une potion pour devenir vert.',
    [ItemType.QuartzSkates]: 'Une potion pour devenir rouge.',
    [ItemType.SapphireFins]: 'Une épée ancienne permettant une puissance incomparable.',
    [ItemType.GeodeBomb]: 'Une armure imbrisable pour survivre à tous les coups.',
    [ItemType.GraniteHammer]: 'Une hache barbarique pour détruire les murs.',
    [ItemType.Random]: 'Cet item correspond à un item aléatoire parmi ceux non utilisés.',
    [ItemType.Start]: 'Point de départ pour un des joueurs.',
    [ItemType.Flag]: 'Ramener le drapeau à son point de départ permet de remporter la partie.',
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
    size: MapSize.Small,
    mode: GameMode.CTF,
    name: '',
    description: '',
    mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
    placedItems: [],
    imageData: '',
};
