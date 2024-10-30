export enum GameEvents {
    DesireStartGame = 'desireStartGame',
    StartGame = 'startGame',
    EndGame = 'endGame',
    ChangeTurn = 'changeTurn',
    StartTurn = 'startTurn',

    MapPreview = 'mapPreview',

    DesiredMove = 'desiredMove',
    PlayerMove = 'playerMove',
    PlayerSlipped = 'playerSlipped',

    DesiredFight = 'desiredFight',
    PlayerFight = 'playerFight',
    StartFightTurn = 'startFightTurn',

    DesiredAttack = 'desiredAttack',
    PlayerAttack = 'playerAttack',
    DesiredEvade = 'desiredEvade',
    PlayerEvade = 'playerEvade',
    EndFightAction = 'endFightAction',
    FightEnd = 'fightEnd',

    DesiredDoor = 'desiredDoor',
    PlayerDoor = 'playerDoor',
    EndAction = 'endAction',
    EndTurn = 'endTurn',

    Abandoned = 'abandoned',
    PlayerAbandoned = 'playerAbandoned',

    RemainingTime = 'remainingTime',
}
