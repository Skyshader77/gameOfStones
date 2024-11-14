export enum GameEvents {
    DesireStartGame = 'desireStartGame',
    StartGame = 'startGame',
    EndGame = 'endGame',
    EndStats = 'endStats',
    ChangeTurn = 'changeTurn',
    StartTurn = 'startTurn',
    LastStanding = 'lastStanding',

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
    PossibleMovement = 'possibleMovement',
    DesireTeleport = 'desireTeleport',
    Teleport = 'teleport',

    DesireDebugMode = 'desireDebugMode',
    DebugMode = 'debugMode',
}
