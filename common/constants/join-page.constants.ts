import { ModalMessage } from '@app/interfaces/modal-message';

export const JOIN_ERROR_TITLES = {
    invalidID: 'Le code est invalide.',
    invalidRoom: 'La partie ne peut pas être rejointe.',

    roomLocked: "La partie n'a pas pu être rejointe.",
};

export const ROOM_DELETED_ERROR_MESSAGE: ModalMessage = {
    title: 'La chambre a été fermée.',
    content: "Cette partie n'existe plus.",
};

export const WRONG_FORMAT_ERROR_MESSAGE: ModalMessage = {
    title: 'Le code est invalide.',
    content: 'Entrez un code de 4 chiffres.',
};

export const INVALID_ROOM_ERROR_MESSAGE: ModalMessage = {
    title: 'La partie ne peut pas être rejointe.',
    content: "Cette partie n'existe pas.",
};

export const ROOM_LOCKED_ERROR_MESSAGE: ModalMessage = {
    title: "La partie n'a pas pu être rejointe.",
    content: 'Cette partie est verrouillée. Voulez-vous réessayer?',
};
