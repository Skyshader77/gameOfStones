import { Game, GameEndOutput, GameStats, GameTimer } from '@app/interfaces/gameplay';
import { Player, PlayerStatistics } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { PlayerInfo, PlayerInGame } from '@common/interfaces/player';
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
        mapArray: [[TileTerrain.OpenDoor, TileTerrain.Water]],
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
        mapArray: [[TileTerrain.Ice, TileTerrain.Wall]],
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
    mapArray: [[TileTerrain.Ice, TileTerrain.Wall]],
    description: 'A map for the Engineers of War',
    placedItems: [
        { position: { x: 0, y: 0 }, type: ItemType.Boost1 },
        { position: { x: 0, y: 0 }, type: ItemType.Boost1 },
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
    numbDefeats: 0,
    numbEscapes: 0,
    numbBattles: 0,
    totalHpLost: 0,
    totalDamageGiven: 0,
    numbPickedUpItems: 0,
    percentageMapVisited: 0,
};

const MOCK_PLAYER_INFO: PlayerInfo[] = [
    {
        id: '1',
        userName: 'Player1',
        avatar: Avatar.FemaleHealer,
        role: PlayerRole.Human,
    },
    {
        id: '2',
        userName: 'Player2',
        avatar: Avatar.MaleHealer,
        role: PlayerRole.Human,
    },
    {
        id: '3',
        userName: 'Player3',
        avatar: Avatar.MaleNinja,
        role: PlayerRole.Human,
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
    winner: '',
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    hasPendingAction: true,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    isTurnChange: false,
};

const MOCK_GAME_W_DOORS: Game = {
    map: MOCK_MAPS[0],
    winner: '',
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    hasPendingAction: true,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    isTurnChange: false,
};

export const MOCK_ROOM: Room = {
    _id: new ObjectId('507f1f77bcf86cd799439011').toString(),
    roomCode: '1A34',
    isLocked: false,
};

export const MOCK_ROOM_LOCKED: Room = {
    _id: new ObjectId('507f1f77bcf86cd799439011').toString(),
    roomCode: '1A34',
    isLocked: true,
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
    winner: '',
    mode: GameMode.NORMAL,
    currentPlayer: 'Player1',
    hasPendingAction: false,
    status: GameStatus.OverWorld,
    stats: MOCK_GAME_STATS,
    isDebugMode: false,
    timer: MOCK_TIMER,
    isTurnChange: false,
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
        winner: '',
        mode: GameMode.NORMAL,
        currentPlayer: '',
        hasPendingAction: false,
        status: GameStatus.OverWorld,
        stats: {} as GameStats,
        timer: {} as GameTimer,
        isTurnChange: false,
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
    ...MOCK_PLAYER_IN_GAME,
    attributes: {
        hp: 4,
        speed: 4,
        attack: 4,
        defense: 4,
    },
};

const MOCK_PLAYER_IN_GAME_FASTEST: PlayerInGame = {
    ...MOCK_PLAYER_IN_GAME,
    attributes: {
        hp: 4,
        speed: 6,
        attack: 4,
        defense: 4,
    },
};

const MOCK_PLAYER_IN_GAME_MEDIUM: PlayerInGame = {
    ...MOCK_PLAYER_IN_GAME,
    attributes: {
        hp: 4,
        speed: 5,
        attack: 4,
        defense: 4,
    },
};

const MOCK_PLAYER_IN_GAME_ABANDONNED: PlayerInGame = {
    ...MOCK_PLAYER_IN_GAME,
    hasAbandoned: true,
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

export const DELTA_RANDOM = 0.01;

export const MOCK_GAME_END_OUTPUT: GameEndOutput = {
    hasGameEnded: false,
    winningPlayerName: '',
};
