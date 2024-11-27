import { Game, GameTimer } from '@app/interfaces/gameplay';
import { Player } from '@common/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { EVASION_COUNT } from '@app/services/fight/fight-logic/fight.service.constants';
import {
    MOCK_PLAYER_IN_GAME,
    MOCK_PLAYER_IN_GAME_ABANDONNED,
    MOCK_PLAYER_IN_GAME_ICE,
    MOCK_PLAYER_IN_GAME_ONE_CONFLICT_POSITION,
    MOCK_PLAYER_IN_GAME_TWO,
    MOCK_PLAYER_IN_GAME_TWO_CONFLICT_POSITION,
} from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { AttackResult } from '@common/interfaces/fight';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { MOCK_MOVEMENT_MAPS } from './player.movement.test.constants';
import { MOCK_ROOM, MOCK_TIMER } from './test.constants';
import { MOCK_GAME_STATS } from './test-stats.constants';

const MOCK_RESPAWN_POINT: Vec2 = { x: 0, y: 0 };

export const MOCK_FIGHTER_ONE: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME,
    playerInfo: {
        id: '1',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_FIGHTER_AI_ONE: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME,
    playerInfo: {
        id: '1',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.AggressiveAI,
    },
};

export const MOCK_FIGHTER_AI_TWO: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_TWO,
    playerInfo: {
        id: '2',
        userName: 'Player2',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.AggressiveAI,
    },
};

export const MOCK_FIGHTER_ONE_ON_ICE: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_ICE,
    playerInfo: {
        id: '1',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_FIGHTER_TWO: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_TWO,
    playerInfo: {
        id: '2',
        userName: 'Player2',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_TIMER_FIGHT: GameTimer = {
    timerId: null,
    counter: 0,
    timerSubject: new Subject(),
    timerSubscription: null,
};

const MOCK_COMBAT_GAME: Game = {
    map: JSON.parse(JSON.stringify(MOCK_MOVEMENT_MAPS.allgrass)),
    winner: '',
    mode: GameMode.Normal,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
        result: { winner: null, loser: null, respawnPosition: MOCK_RESPAWN_POINT },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

const MOCK_COMBAT_GAME_AIS: Game = {
    map: JSON.parse(JSON.stringify(MOCK_MOVEMENT_MAPS.allgrass)),
    winner: '',
    mode: GameMode.Normal,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_AI_ONE, MOCK_FIGHTER_AI_TWO],
        result: { winner: null, loser: null, respawnPosition: MOCK_RESPAWN_POINT },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

const MOCK_COMBAT_GAME_ONE_AI: Game = {
    map: JSON.parse(JSON.stringify(MOCK_MOVEMENT_MAPS.allgrass)),
    winner: '',
    mode: GameMode.Normal,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_AI_ONE],
        result: { winner: null, loser: null, respawnPosition: MOCK_RESPAWN_POINT },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

export const MOCK_FIGHTER_ONE_CONFLICT_POSITION: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_ONE_CONFLICT_POSITION,
    playerInfo: {
        id: '1',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

export const MOCK_FIGHTER_TWO_CONFLICT_POSITION: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_TWO_CONFLICT_POSITION,
    playerInfo: {
        id: '2',
        userName: 'Player2',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
};

const MOCK_COMBAT_GAME_START_POSITION_OCCUPIED: Game = {
    map: JSON.parse(JSON.stringify(MOCK_MOVEMENT_MAPS.allgrass)),
    winner: '',
    mode: GameMode.Normal,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_ONE_CONFLICT_POSITION, MOCK_FIGHTER_TWO_CONFLICT_POSITION],
        result: { winner: null, loser: null, respawnPosition: MOCK_RESPAWN_POINT },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

const MOCK_COMBAT_ICE: Game = {
    map: JSON.parse(JSON.stringify(MOCK_MOVEMENT_MAPS.untrapped)),
    winner: '',
    mode: GameMode.Normal,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    fight: {
        fighters: [MOCK_FIGHTER_ONE_ON_ICE, MOCK_FIGHTER_TWO],
        result: { winner: null, loser: null, respawnPosition: MOCK_RESPAWN_POINT },
        isFinished: false,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false,
        timer: MOCK_TIMER,
    },
    isTurnChange: false,
};

export const MOCK_ROOM_COMBAT: RoomGame = {
    room: JSON.parse(JSON.stringify(MOCK_ROOM)),
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME,
};

export const MOCK_ROOM_AIS: RoomGame = {
    room: JSON.parse(JSON.stringify(MOCK_ROOM)),
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_AI_ONE],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME_AIS,
};

export const MOCK_ROOM_ONE_AI: RoomGame = {
    room: JSON.parse(JSON.stringify(MOCK_ROOM)),
    players: [MOCK_FIGHTER_AI_ONE, MOCK_FIGHTER_AI_TWO],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME_ONE_AI,
};

export const MOCK_ROOM_COMBAT_CONFLICT_START_POSITIONS: RoomGame = {
    room: JSON.parse(JSON.stringify(MOCK_ROOM)),
    players: [MOCK_FIGHTER_ONE_CONFLICT_POSITION, MOCK_FIGHTER_TWO_CONFLICT_POSITION],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_GAME_START_POSITION_OCCUPIED,
};

export const MOCK_ROOM_COMBAT_ICE: RoomGame = {
    room: JSON.parse(JSON.stringify(MOCK_ROOM)),
    players: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
    chatList: [],
    journal: [],
    game: MOCK_COMBAT_ICE,
};

export const MOCK_FIGHTER_TWO_ABANDONNED: Player = {
    playerInGame: MOCK_PLAYER_IN_GAME_ABANDONNED,
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

export const MOCK_ATTACK_RESULT: AttackResult = {
    hasDealtDamage: true,
    wasWinningBlow: true,
    attackRoll: 1,
    defenseRoll: 1,
};
