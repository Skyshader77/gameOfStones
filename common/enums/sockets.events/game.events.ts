export enum GameEvents {
    DesireStartGame = 'desireStartGame',
    StartGame = 'startGame',
    EndGame = 'endGame',
    ChangeTurn = 'changeTurn',
    StartTurn = 'startTurn',

    DesiredMove = 'desiredMove',
    PlayerMove = 'playerMove',
    PlayerSlipped = 'playerSlipped',

    DesiredFight = 'desiredFight',
    StartFight = 'startFight',
    StartFightTurn = 'startFightTurn',

    DesiredAttack = 'desiredAttack',
    FighterAttack = 'fighterAttack',
    DesiredEvade = 'desiredEvade',
    FighterEvade = 'fighterEvade',
    EndFightAction = 'endFightAction',
    FightEnd = 'fightEnd',

    DesiredDoor = 'desiredDoor',
    PlayerDoor = 'playerDoor',
    EndAction = 'endAction',
    EndTurn = 'endTurn',

    Abandoned = 'abandoned',
    PlayerAbandoned = 'playerAbandoned',

    RemainingTime = 'remainingTime',
    PossibleMovement = "PossibleMovement",
}
