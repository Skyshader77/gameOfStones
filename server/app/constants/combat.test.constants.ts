import { GameMode } from "@app/interfaces/gamemode";
import { Game, GameStats } from "@app/interfaces/gameplay";
import { Player } from "@app/interfaces/player";
import { Fight } from "@common/interfaces/fight";
import { PlayerRole, PlayerStatus } from "@common/interfaces/player.constants";
import { MOCK_MAPS } from "./test-constants";

export const MOCK_PLAYER_ONE:Player = {
    id: 'player1',
    userName: 'Player One',
    playerInGame: {
        hp: 10,
        movementSpeed: 5,
        dice: {
            attackDieValue: 6,
            defenseDieValue: 6
        },
        attack: 5,
        defense: 3,
        inventory: [],
        currentPosition: { x: 0, y: 0 },
        hasAbandonned: false
    },
    statistics: {
        isWinner: false,
        numbVictories: 0,
        numbDefeats: 0,
        numbEscapes: 0,
        numbBattles: 0,
        totalHpLost: 0,
        totalDamageGiven: 0,
        numbPickedUpItems: 0,
        percentageMapVisited: 0
    },
    role: PlayerRole.ORGANIZER
}

export const MOCK_PLAYER_TWO:Player = {
    id: 'player2',
    userName: 'Player Two',
    playerInGame: {
        hp: 8,
        movementSpeed: 4,
        dice: {
            attackDieValue: 6,
            defenseDieValue: 6
        },
        attack: 4,
        defense: 2,
        inventory: [],
        currentPosition: { x: 1, y: 1 },
        hasAbandonned: false
    },
    statistics: {
        isWinner: false,
        numbVictories: 0,
        numbDefeats: 0,
        numbEscapes: 0,
        numbBattles: 0,
        totalHpLost: 0,
        totalDamageGiven: 0,
        numbPickedUpItems: 0,
        percentageMapVisited: 0
    },
    role: PlayerRole.HUMAN
}

export const MOCK_FIGHT:Fight = {
    playerIds: ['player1', 'player2'],
    numbEvasionsLeft: [2, 1],
    Timer: 0
}

export const MOCK_GAME:Game = {
    players: [MOCK_PLAYER_ONE, MOCK_PLAYER_TWO],
    currentPlayer: 'player1',
    map: MOCK_MAPS[0],
    winner: 0,
    mode: GameMode.NORMAL,
    actionsLeft: 0,
    playerStatus: PlayerStatus.WAITING,
    stats: new GameStats,
    isDebugMode: false,
    timerValue: 0
} 