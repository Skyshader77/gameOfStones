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

    DesirePickupItem = 'desiredPickupItem',
    DesireUseItem = 'desiredUseItem',
    DesireDropItem = 'desiredDropItem',
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
    PossibleMovement = 'PossibleMovement',
    ServerError = 'ServerError'
}
