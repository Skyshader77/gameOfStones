import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { faBackward, faEdit, faFileImport, faPlus, faX, faFileExport } from '@fortawesome/free-solid-svg-icons';

export const ADMIN_MAP_ERROR_TITLE = {
    hideUnhide: 'Erreur lors de la modification de visibilité',
    deleteMap: 'Erreur lors de la suppression de carte',
    updateMap: 'Erreur lors de la modification de carte',
    createMap: 'Erreur lors de la création de carte',
};

export enum GameModes {
    CLASSIC = GameMode.Normal,
    CTF = GameMode.CTF,
}

export enum MapSizes {
    SMALL = MapSize.Small,
    MEDIUM = MapSize.Medium,
    LARGE = MapSize.Large,
}

export const GAME_MODES = [
    { value: GameModes.CLASSIC, label: 'Classique' },
    { value: GameModes.CTF, label: 'Capture du Drapeau' },
];

export const MAP_SIZES = [
    { value: MapSizes.SMALL, label: '10 x 10' },
    { value: MapSizes.MEDIUM, label: '15 x 15' },
    { value: MapSizes.LARGE, label: '20 x 20' },
];

export const ADMIN_TABLE_COLUMNS = ['Sélectionner', 'Nom', 'Taille', 'Mode', 'Date de dernière modification', 'Actions', 'Visible', 'Aperçu'];

export const ADMIN_ICONS = { faBackward, faFileImport, faPlus, faX, faEdit, faFileExport };

export const RADIO_INPUT = 'radio';
export const DATE_FORMAT = 'MMM dd, yyyy hh:mm:ss a';

export const EXCLUSION_FIELDS = ['isVisible', '__v', 'TILE_COSTS'];

export const JSON_INDENTATION = 2;
export const REGEX_ARRAY_PATTERN = /\[\n\s+(\d+,\n\s+)+\d+\n\s+\]/g;
export const REGEX_WHITESPACE_PATTERN = /\s+/g;
export const REGEX_NEWLINE_PATTERN = /\n/g;

export const DOWNLOAD_BLOB_TYPE = 'application/json';
export const DOWNLOAD_ANCHOR = 'a';
export const DOWNLOAD_MAP_PREFIX = 'GoS_';
export const DOWNLOAD_MAP_SUFFIX = '_map.json';

export const REQUIRED_MAP_FIELDS = ['name', 'description', 'size', 'mode', 'mapArray', 'placedItems', 'imageData'];
export const CHAMP_MANQUANT = 'Le champ suivant est manquant: ';
export const CHAMPS_MANQUANTS = 'Les champs suivants sont manquants: ';

export const JSON_MISSING_FIELDS: { [key: string]: string } = {
    name: '- Le nom de la carte',
    description: '- La description de la carte',
    size: '- La taille de la carte',
    mode: '- Le mode de jeu',
    mapArray: '- Le tableau de tuiles',
    placedItems: '- La liste des items placés',
    imageData: "- Les données de la capture d'écran",
};

export const INVALID_JSON_FILE_TITLE = 'Fichier JSON invalide';
export const INVALID_JSON_FILE_MESSAGE = "Le fichier JSON téléversé n'est pas un fichier JSON valide.";

export const INVALID_MAP_TITLE = 'Carte invalide';

export const MAP_EXISTS_TITLE = 'Ce nom est déjà pris';
export const MAP_EXISTS_MESSAGE = 'Veuillez choisir un autre nom de 1 à 30 charactères.';
export const MAP_EXISTS_PLACEHOLDER = 'Veuillez entrer un autre nom';

export const FILE_UPLOAD = 'input';
export const FILE_UPLOAD_TYPE = 'file';
export const FILE_UPLOAD_EXTENSION = '.json';

export const IMPORT_SUCCESS_TITLE = 'Succès';
export const IMPORT_SUCCESS_MESSAGE = 'Carte importée avec succès';

export const MAX_MAP_NAME_LENGTH = 30;

export const JSON_VALIDATION_ERROR_TITLE = 'Fichier JSON erronée';

export const JSON_VALIDATION_ERRORS = {
    invalidMapSize: 'La taille ${mapSize} est invalide. Les cartes doivent être de taille 10, 15 ou 20.',
    invalidRows: 'La carte ne contient pas le bon nombre de rangées. Elle doit avoir ${expectedDimensions} rangées.',
    invalidColumns: 'Une ou plusieurs rangées ne contienent pas le bon nombre de colonnes. Chaque rangée doit avoir ${expectedDimensions} colonnes.',
    invalidTileTypes:
        'Une ou plusieurs tuiles ont des valeurs invalides. Les valeurs des tuiles doivent être comprises entre 0 et 5. ${value} a été trouvé.',
    invalidItemTypes: "Un ou plusieurs items ont des types invalides. Les types d'items doivent être compris entre 0 et 9. ${itemType} a été trouvé.",
    invalidItemPositions:
        'Un ou plusieurs items sont placés en dehors des limites de la carte. ' +
        'Les positions doivent être comprises entre 0 et ${maxSize}. ' +
        '${itemPosition} a été trouvé.',
    invalidItemTerrain:
        'Un ou plusieurs items sont placés sur des tuiles invalides. ' +
        'Les items doivent être placés sur des tuiles de type herbe, eau ou glace. ' +
        "L'item à la position ${itemPosition} est sur un terrain invalide.",
    invalidItemSuperposition: "Il y a plus d'un item à la position ${itemPosition}.",
    invalidGameMode: 'Le mode ${gameMode} est invalide. Les modes acceptés sont 0 ou 1.',
    successfulValidation: 'Validation Réussie',
};
