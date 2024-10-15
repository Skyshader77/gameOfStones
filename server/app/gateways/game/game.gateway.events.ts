export enum GameEvents {
    StartGame = 'startGame',
    EndGame = 'endGame',
    ChangeTurn = 'changeTurn',
    StartTurn = 'startTurn',

    DesiredMove = 'desiredMove',
    PlayerMove = 'playerMove',
    PlayerSlipped = 'playerSlipped',

    DesiredFight = 'desiredFight',
    PlayerFight = 'playerFight',
    DesiredAttack = 'desiredAttack',
    PlayerAttack = 'playerAttack',
    DesiredEvade = 'desiredEvade',
    PlayerEvade = 'playerEvade',
    FightEnd = 'fightEnd',

    DesiredDoor = 'desiredDoor',
    PlayerDoor = 'playerDoor',
    EndMove = 'endAction',
    EndTurn = 'endTurn',

    Abandoned = 'abandoned',
    PlayerAbandoned = 'playerAbandoned',

    Time = 'time',
}
