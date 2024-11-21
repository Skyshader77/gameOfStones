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

    DesiredDoor = 'desiredDoor',
    PlayerDoor = 'playerDoor',
    EndAction = 'endAction',
    EndTurn = 'endTurn',

    Abandoned = 'abandoned',
    PlayerAbandoned = 'playerAbandoned',

    RemainingTime = 'remainingTime',
    TurnInfo = 'turnInfo',

    DesireTeleport = 'desireTeleport',
    Teleport = 'teleport',

    DesireDebugMode = 'desireDebugMode',
    DebugMode = 'debugMode',
    ServerError = 'ServerError',
}
