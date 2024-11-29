export enum GameEvents {
    DesireStartGame = 'desireStartGame',
    StartGame = 'startGame',
    EndGame = 'endGame',
    EndStats = 'endStats',
    ChangeTurn = 'changeTurn',
    StartTurn = 'startTurn',
    LastStanding = 'lastStanding',

    DesireMove = 'desireMove',
    PlayerMove = 'playerMove',
    PlayerSlipped = 'playerSlipped',

    DesireFight = 'desireFight',
    DesiredFightTimer = 'desiredFightTimer',
    StartFight = 'startFight',
    StartFightTurn = 'startFightTurn',

    DesireAttack = 'desireAttack',
    FighterAttack = 'fighterAttack',
    DesireEvade = 'desireEvade',
    FighterEvade = 'fighterEvade',
    EndFightAction = 'endFightAction',
    FightEnd = 'fightEnd',

    DesirePickupItem = 'desirePickupItem',
    DesireUseItem = 'desireUseItem',
    DesireDropItem = 'desireDropItem',
    InventoryFull = 'inventoryFull',
    ItemPickedUp = 'itemPickedUp',
    ItemDropped = 'itemDropped',
    CloseItemDropModal = 'closeItemDropModal',
    BombUsed = 'bombUsed',
    HammerUsed = 'hammerUsed',

    DesireToggleDoor = 'desireToggleDoor',
    ToggleDoor = 'toggleDoor',
    EndAction = 'endAction',
    EndTurn = 'endTurn',

    PlayerDead = 'playerDead',

    Abandoned = 'abandoned',
    PlayerAbandoned = 'playerAbandoned',

    RemainingTime = 'remainingTime',
    TurnInfo = 'turnInfo',

    DesireTeleport = 'desireTeleport',
    Teleport = 'teleport',

    DesireDebugMode = 'desireDebugMode',
    DebugMode = 'debugMode',
    ServerError = 'serverError',
}
