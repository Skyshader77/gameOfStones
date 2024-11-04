import { Game, GameTimer } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Map } from '@app/model/database/map';
import { RoomGame } from '@app/interfaces/room-game';
import { MOCK_ROOM } from './test.constants';
import { EVASION_COUNT } from '@app/services/fight/fight/fight.service.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MOCK_PLAYER_IN_GAME, MOCK_PLAYER_IN_GAME_ABANDONNED } from '@common/constants/test-players';

export const MOCK_FIGHTER_ONE: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME,
    statistics: {
        isWinner: false,
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
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_FIGHTER_TWO: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME,
    statistics: {
        isWinner: false,
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
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_TIMER: GameTimer = {
    timerId: null,
    counter: 0,
    timerSubject: null,
    timerSubscription: null,
};

const MOCK_COMBAT_GAME: Game = {
    map: new Map(),
    winner: '',
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: {
        timeTaken: new Date(),
        percentageDoorsUsed: 0,
        numberOfPlayersWithFlag: 0,
        highestPercentageOfMapVisited: 0,
    },
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
        result: { winner: null, loser: null },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

export const MOCK_ROOM_COMBAT: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME,
};

export const MOCK_FIGHTER_TWO_ABANDONNED: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_ABANDONNED,
    statistics: {
        isWinner: false,
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
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_ROOM_COMBAT_ABANDONNED: RoomGame = {
    room: MOCK_ROOM,
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO_ABANDONNED],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME,
};

export const DIE_ROLL_5_RESULT = 0.83;
export const DIE_ROLL_1_RESULT = 0.01;
export const DIE_ROLL_6_RESULT = 0.99;
