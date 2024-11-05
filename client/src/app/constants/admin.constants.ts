import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { faBackward, faEdit, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';

export const ADMIN_MAP_ERROR_TITLE = {
    hideUnhide: 'Erreur lors de la modification de visibilité',
    deleteMap: 'Erreur lors de la suppression de carte',
    updateMap: 'Erreur lors de la modification de carte',
    createMap: 'Erreur lors de la création de carte',
};

export const GAME_MODES = [
    { value: GameMode.Normal, label: 'Classique' },
    { value: GameMode.CTF, label: 'Capture du Drapeau' },
];

export const MAP_SIZES = [
    { value: MapSize.Small, label: '10 x 10' },
    { value: MapSize.Medium, label: '15 x 15' },
    { value: MapSize.Large, label: '20 x 20' },
];

export const ADMIN_TABLE_COLUMNS = ['Sélectionner', 'Nom', 'Taille', 'Mode', 'Date de dernière modification', 'Actions', 'Visible', 'Aperçu'];

export const ADMIN_ICONS = { faBackward, faFileImport, faPlus, faX, faEdit };

export const RADIO_INPUT = 'radio';
export const DATE_FORMAT = 'MMM dd, yyyy hh:mm:ss a';
