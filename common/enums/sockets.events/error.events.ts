export enum ServerErrorEvents {
    errorDesiredMove = 'errorDesiredMove',
    errorItemDrop = 'errorItemDrop',
    errorDesiredDoor='errorDesiredDoor',
    errorDesiredEndAction='errorEndAction',
    errorStartGame='errorStartGame',
    errorEndTurn='errorEndTurn',
    errorAbandon='errorAbandon',
    errorStartFight='errorStartFight',
    errorEvade='errorEvade',
    errorAttack='errorAttack',
    errorEndFightTurn='errorEndFightTurn',
}

export enum ServerErrorEventsMessages{
    errorMessageDesiredMove='Erreur de mouvement pour le joueur: ',
    errorMessageDropItem='Erreur de prise de item pour le joueur: ',
    errorMessageDesiredDoor='Erreur de interaction de porte de item pour le joueur: ',
    errorMessageDesiredEndAction='Erreur de find de action pour le joueur: ',
    errorMessageStartGame='Impossible de demarrer la partie',
    errorMessageDesiredEndTurn='Erreur de fin de tour pour le joueur: ',
    errorMessageAbandon='Erreur de abandon pour le joueur: ',
    errorMessageStartFight='Erreur de debut de combat pour le joueur: ',
    errorMessageEvade='Erreur de evasion pour le joueur: ',
    errorMessageAttack='Erreur de attaque pour le joueur: ',
    errorEndFightTurn='Erreur de fin de tour de combat pour le joueur: ',
}