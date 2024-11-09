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

export const DOWNLOAD_BLOB_TYPE = 'application/json';
export const DOWNLOAD_ANCHOR = 'a';
export const DOWNLOAD_MAP_PREFIX = 'GoS_';
export const DOWNLOAD_MAP_SUFFIX = '_map.json';

export const REQUIRED_MAP_FIELDS = ['_id', 'name', 'description', 'size', 'mode', 'mapArray', 'placedItems'];
