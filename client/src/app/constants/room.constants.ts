import { ModalMessage } from '@app/interfaces/modal-message';

export const ROOM_CREATION_STATUS = {
    success: 'La chambre a été créée!',
    noSelection: 'Aucune carte a été sélectionnée!',
    noLongerExists: "La carte sélectionnée n'existe plus!",
    isNotVisible: 'La carte sélectionnée ne peut pas être sélectionnée pour créer un jeu!',
};

export const LEAVE_ROOM_CONFIRMATION_MESSAGE: ModalMessage = {
    title: "Confirmation d'action",
    content: 'Êtes-vous certain de vouloir quitter la salle?',
};
