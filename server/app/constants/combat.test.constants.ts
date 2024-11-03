import { Game, GameStats, GameTimer } from "@app/interfaces/gameplay";
import { Player } from "@app/interfaces/player";
import { PlayerRole } from "@common/constants/player.constants";
import { GameMode } from "@common/enums/game-mode.enum";
import { GameStatus } from "@common/enums/game-status.enum";
import { Map } from '@app/model/database/map';
import { RoomGame } from "@app/interfaces/room-game";
import { MOCK_ROOM } from "./test.constants";
import { EVASION_COUNT } from "@app/services/fight/fight/fight.service.constants";
export const MOCK_FIGHTER_ONE: Player = {
    playerInGame: {
        hp: 10,
        movementSpeed: 5,
        dice: {
            attackDieValue: 6,
            defenseDieValue: 6,
        },
        attack: 5,
        defense: 3,
        inventory: [],
        currentPosition: { x: 0, y: 0 },
        hasAbandonned: false,
        remainingHp: 10,
        remainingMovement: 0,
        wins: 0,
        startPosition: undefined,
        isCurrentPlayer: false
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
        percentageMapVisited: 0,
    },
    playerInfo: {
        id: '1',
        userName: 'Player1',
        role: PlayerRole.HUMAN,
    }
};

export const MOCK_FIGHTER_TWO: Player = {
    playerInGame: {
        hp: 8,
        movementSpeed: 4,
        dice: {
            attackDieValue: 6,
            defenseDieValue: 6,
        },
        attack: 4,
        defense: 2,
        inventory: [],
        currentPosition: { x: 0, y: 1 },
        hasAbandonned: false,
        remainingHp: 8,
        remainingMovement: 0,
        wins: 0,
        startPosition: undefined,
        isCurrentPlayer: false
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
        percentageMapVisited: 0,
    },
    playerInfo: {
        id: '2',
        userName: 'Player2',
        role: PlayerRole.HUMAN,
    }
};

export const MOCK_TIMER: GameTimer = {
    timerId: null,
    counter: 0,
    isTurnChange: false,
    timerSubject: null,
    fightTimerSubject: null,
    timerSubscription: null,
}

const MOCK_COMBAT_GAME: Game = {
    map: new Map(),
    winner: 0,
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    actionsLeft: 0,
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: new GameStats(),
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: { fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO], winner: null, loser: null, numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT], currentFighter: 0, hasPendingAction: false, timer: MOCK_TIMER }
};

export const MOCK_ROOM_COMBAT: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME
}

export const DIE_ROLL_5_RESULT = 0.83;
export const DIE_ROLL_1_RESULT = 0.01;
export const DIE_ROLL_6_RESULT = 0.99;