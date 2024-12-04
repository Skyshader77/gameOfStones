import { ModalMessage } from '@app/interfaces/modal-message';

export const KICKED_PLAYER_MESSAGE: ModalMessage = { title: "Vous avez été exclu de la partie par l'organisateur.", content: '' };
export const ROOM_CLOSED_MESSAGE: ModalMessage = { title: "La chambre a été fermée puisque l'organisateur a quitté.", content: '' };
export const LEFT_ROOM_MESSAGE: ModalMessage = { title: 'Vous avez quitté la partie puisque vous avez rafraîchi la page.', content: '' };

export const LAST_STANDING_MESSAGE: ModalMessage = { title: 'La partie est terminée puisque vous êtes le dernier joueur', content: '' };

export const ABANDON_MESSAGE_PART_ONE = 'Sous les regards tendus des seigneurs et des soldats, ';
export const ABANDON_MESSAGE_PART_TWO = ' déposa enfin son épée au sol, le bruit du métal résonnant lourdement sur la terre battue.';
