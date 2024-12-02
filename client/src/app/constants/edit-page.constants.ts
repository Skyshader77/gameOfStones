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
    [TileTerrain.Grass]: 'Un terrain verdoyant qui procure un léger répit.',
    [TileTerrain.Water]: 'Une surface aquatique qui ralentit vos déplacements.',
    [TileTerrain.Wall]: 'Une barrière infranchissable. Trouvez un autre chemin.',
    [TileTerrain.Ice]: 'Glissant et imprévisible, avancez avec précaution.',
    [TileTerrain.ClosedDoor]: 'Une porte fermée qui peut être ouverte au prix d’une action.',
    [TileTerrain.OpenDoor]: 'Une porte ouverte permettant un passage facile.',
};

type ItemDescriptionMap = Record<ItemType, string>;

export const ITEM_DESCRIPTIONS: ItemDescriptionMap = {
    [ItemType.BismuthShield]: 'Un bouclier irisé qui ralentit son porteur, mais offre une défense inébranlable face aux attaques les plus féroces.',
    [ItemType.GlassStone]: 'Une pierre translucide qui augmente l’attaque tout en réduisant la défense.',
    [ItemType.QuartzSkates]: 'Des patins enchantés qui augmentent de +3 l’attaque et la défense sur la glace.',
    [ItemType.SapphireFins]: 'Des nageoires mystiques qui transforment l’eau en un terrain favorable, rendant les coûts de déplacements nul.',
    [ItemType.GeodeBomb]: 'Une bombe géodique dévastatrice qui libère une énergie brute, éliminant tous les ennemis dans un rayon dévastateur.',
    [ItemType.GraniteHammer]:
        'Un marteau légendaire qui écrase tout sur son passage, éliminant les ennemis dans une ligne droite à portée de frappe.',
    [ItemType.Random]: 'Un objet mystérieux, tiré du hasard, porteur de grandes surprises.',
    [ItemType.Start]: 'Le point de départ, là où tout commence.',
    [ItemType.Flag]: 'L’emblème de la victoire, ramené au bastion, il marque le triomphe.',
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
