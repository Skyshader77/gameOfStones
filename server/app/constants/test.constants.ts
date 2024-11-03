import { Game, GameStats, GameTimer } from '@app/interfaces/gameplay';
import { Player, PlayerInfo, PlayerInGame, PlayerStatistics } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { D6_ATTACK_FIELDS, PlayerRole } from '@common/constants/player.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { ObjectId } from 'mongodb';
import { MOCK_TIMER } from './combat.test.constants';

export const ROOM_CODE_LENGTH = 4;
export const MOCK_MAPS: Map[] = [
    {
        size: MapSize.SMALL,
        name: 'Engineers of War',
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        isVisible: true,
        mode: GameMode.NORMAL,
        mapArray: [[TileTerrain.OPENDOOR, TileTerrain.WATER]],
        description: 'A map for the Engineers of War',
        placedItems: [],
        _id: new ObjectId().toString(),
        imageData: 'kesdf',
    },
    {
        size: MapSize.SMALL,
        name: 'Defenders of Satabis',
        dateOfLastModification: new Date('December 18, 1995 03:24:00'),
        isVisible: false,
        mode: GameMode.CTF,
        mapArray: [[TileTerrain.ICE, TileTerrain.WALL]],
        description: 'A map for the Defenders of Satabis',
        placedItems: [],
        _id: new ObjectId().toString(),
        imageData: 'amvdvnak',
    },
];

export const MOCK_MAP_DTO: CreateMapDto = {
    name: 'Engineers of War',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: [[TileTerrain.ICE, TileTerrain.WALL]],
    description: 'A map for the Engineers of War',
    placedItems: [
        { position: { x: 0, y: 0 }, type: ItemType.BOOST1 },
        { position: { x: 0, y: 0 }, type: ItemType.BOOST1 },
    ],
    imageData: 'ajfa',
};

const MOCK_GAME_STATS: GameStats = {
    timeTaken: new Date('2024-11-01T00:30:00'), // 30 minutes
    percentageDoorsUsed: 75.5,
    numberOfPlayersWithFlag: 2,
    highestPercentageOfMapVisited: 85.3,
};

const MOCK_PLAYER_STATS: PlayerStatistics = {
    isWinner: false,
    numbVictories: 0,
    numbDefeats: 0,
    numbEscapes: 0,
    numbBattles: 0,
    totalHpLost: 0,
    totalDamageGiven: 0,
    numbPickedUpItems: 0,
    percentageMapVisited: 0,
};

const MOCK_PLAYER_IN_GAME: PlayerInGame = {
    hp: 4,
    remainingHp: 4,
    movementSpeed: 6,
    wins: 0,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hasAbandonned: false,
    remainingMovement: 0,
    isCurrentPlayer: false,
};

const MOCK_PLAYER_INFO: PlayerInfo[] = [
    {
        id: '1',
        userName: 'Player1',
        role: PlayerRole.HUMAN,
    },
    {
        id: '2',
        userName: 'Player2',
        role: PlayerRole.HUMAN,
    },
    {
        id: '3',
        userName: 'Player3',
        role: PlayerRole.HUMAN,
    },
];
export const MOCK_PLAYERS: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME,
    },
];

const MOCK_GAME: Game = {
    map: new Map(),
    winner: 0,
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    actionsLeft: 1,
    hasPendingAction: true,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
};

const MOCK_GAME_W_DOORS: Game = {
    map: MOCK_MAPS[0],
    winner: 0,
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    actionsLeft: 1,
    hasPendingAction: true,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER
};

export const MOCK_ROOM: Room = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    roomCode: '1A34',
    isLocked: false,
};

export const MOCK_ROOM_GAME_W_DOORS: RoomGame = {
    room: MOCK_ROOM,
    players: MOCK_PLAYERS,
    chatList: [],
    journal: [],
    game: MOCK_GAME_W_DOORS,
};

const MOCK_GAME_NO_ACTIONS: Game = {
    map: new Map(),
    winner: 0,
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    actionsLeft: 0,
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER
};

export const MOCK_EMPTY_ROOM_GAME: RoomGame = {
    room: {
        roomCode: 'test-room-id',
        isLocked: false,
    },
    players: [],
    chatList: [],
    journal: [],
    game: {
        map: new Map(),
        winner: 0,
        mode: GameMode.NORMAL,
        currentPlayer: '',
        actionsLeft: 0,
        hasPendingAction: false,
        status: GameStatus.OverWorld,
        stats: {} as GameStats,
        timer: {} as GameTimer,
        isDebugMode: false,
    },
};

export const MOCK_PLAYER_SOCKET_INDICES: PlayerSocketIndices = {
    room: 'roomSocket',
    messaging: 'chatSocket',
    game: 'gameSocket',
};

export const MOCK_ROOM_GAME: RoomGame = {
    room: MOCK_ROOM,
    players: MOCK_PLAYERS,
    chatList: [],
    journal: [],
    game: MOCK_GAME,
};

export const MOCK_NEW_ROOM_GAME: RoomGame = {
    room: MOCK_ROOM,
    players: [],
    chatList: [],
    journal: [],
    game: MOCK_GAME,
};

export const MOCK_ROOM_NO_MOVES: RoomGame = {
    room: MOCK_ROOM,
    players: [],
    chatList: [],
    journal: [],
    game: MOCK_GAME_NO_ACTIONS,
};

const MOCK_PLAYER_IN_GAME_SLOWEST: PlayerInGame = {
    hp: 4,
    remainingHp: 4,
    movementSpeed: 1,
    wins: 0,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hasAbandonned: false,
    remainingMovement: 0,
    isCurrentPlayer: false,
};

const MOCK_PLAYER_IN_GAME_FASTEST: PlayerInGame = {
    hp: 4,
    remainingHp: 4,
    movementSpeed: 5,
    wins: 0,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hasAbandonned: false,
    remainingMovement: 0,
    isCurrentPlayer: false,
};

const MOCK_PLAYER_IN_GAME_MEDIUM: PlayerInGame = {
    hp: 4,
    remainingHp: 4,
    movementSpeed: 3,
    wins: 0,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hasAbandonned: false,
    remainingMovement: 0,
    isCurrentPlayer: false,
};

const MOCK_PLAYER_IN_GAME_ABANDONNED: PlayerInGame = {
    hp: 4,
    remainingHp: 4,
    movementSpeed: 3,
    wins: 0,
    dice: D6_ATTACK_FIELDS,
    attack: 4,
    defense: 4,
    inventory: [],
    currentPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hasAbandonned: true,
    remainingMovement: 0,
    isCurrentPlayer: false,
};

export const MOCK_PLAYERS_DIFFERENT_SPEEDS: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_FASTEST,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_MEDIUM,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[2],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_SLOWEST,
    },
];

export const MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED: RoomGame = {
    room: MOCK_ROOM,
    players: MOCK_PLAYERS_DIFFERENT_SPEEDS,
    chatList: [],
    journal: [],
    game: MOCK_GAME,
};

export const MOCK_PLAYERS_DIFFERENT_SPEEDS_W_ABANDONMENT: Player[] = [
    {
        playerInfo: MOCK_PLAYER_INFO[0],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_FASTEST,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[1],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_ABANDONNED,
    },
    {
        playerInfo: MOCK_PLAYER_INFO[2],
        statistics: MOCK_PLAYER_STATS,
        playerInGame: MOCK_PLAYER_IN_GAME_SLOWEST,
    },
];

export const MOCK_ROOM_GAME_PLAYER_ABANDONNED: RoomGame = {
    room: MOCK_ROOM,
    players: MOCK_PLAYERS_DIFFERENT_SPEEDS_W_ABANDONMENT,
    chatList: [],
    journal: [],
    game: MOCK_GAME,
};
