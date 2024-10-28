import { Game, GameStats, GameTimer } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { D6_ATTACK_FIELDS, PlayerRole, PlayerStatus } from '@common/constants/player.constants';
import { MOCK_ROOM } from './test.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MapSize } from '@common/enums/map-size.enum';

export const INVALID_POSITIVE_COORDINATE = 99;
export const INVALID_NEGATIVE_COORDINATE = -99;
const DEFAULT_DESCRIPTION = 'A mock map';
const DEFAULT_IMAGE_DATA = 'ajfa';
const DEFAULT_MAX_DISPLACEMENT = 5;
const DEFAULT_MAP_NAME = 'Engineers of War';
export const FIFTEEN_PERCENT = 0.15;
export const NINE_PERCENT = 0.09;
export const SLIP_PROBABILITY = 0.1;

const MOCK_PLAYER_3_X = 3;
const MOCK_PLAYER_3_Y = 4;
const wallsAndIce: TileTerrain[][] = [
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
];

const closedDoorsAndIce: TileTerrain[][] = [
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
];

const openDoorsAndIce: TileTerrain[][] = [
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.CLOSEDDOOR],
    [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
];

const zigZagPath: TileTerrain[][] = [
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.ICE],
    [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.ICE],
    [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.WATER],
];

const allGrassMap: TileTerrain[][] = [
    [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
    [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
    [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
];

const allWaterMap: TileTerrain[][] = [
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
];

const weirdMap: TileTerrain[][] = [
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.GRASS],
    [TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR, TileTerrain.ICE],
    [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR],
    [TileTerrain.OPENDOOR, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.WALL, TileTerrain.GRASS],
    [TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR],
];

interface CreateMockMapOptions {
    name?: string;
    terrain: TileTerrain[][];
    description?: string;
    imageData?: string;
}

const createMockMap = ({
    name = DEFAULT_MAP_NAME,
    terrain,
    description = DEFAULT_DESCRIPTION,
    imageData = DEFAULT_IMAGE_DATA,
}: CreateMockMapOptions): Map => ({
    name,
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: terrain.map((row) => row.map((terrainType) => terrainType)),
    description,
    placedItems: [],
    imageData,
    isVisible: false,
    dateOfLastModification: undefined,
    _id: '',
});

interface CreateMockGameOptions {
    map: Map;
    mode?: GameMode;
    currentPlayer?: number;
    winner?: number;
    actionsLeft?: number;
    stats?: GameStats;
    playerStatus?: PlayerStatus;
    isDebugMode?: boolean;
    timer?: GameTimer;
}

const createMockGame = ({
    map,
    mode = GameMode.NORMAL,
    currentPlayer = 0,
    winner = 0,
    actionsLeft = 1,
    stats = {
        timeTaken: new Date(),
        percentageDoorsUsed: 0,
        numberOfPlayersWithFlag: 0,
        highestPercentageOfMapVisited: 0,
    },
    playerStatus = PlayerStatus.WAITING,
    isDebugMode = false,
    timer = { turnCounter: 0, fightCounter: 0, timerId: null, timerSubject: null, timerSubscription: null },
}: CreateMockGameOptions): Game => ({
    map,
    winner,
    mode,
    currentPlayer,
    actionsLeft,
    playerStatus,
    stats,
    isDebugMode,
    timer,
});

const createMockPlayer = (id: string, userName: string, role: PlayerRole, x: number, y: number): Player => ({
    playerInfo: {
        id,
        userName,
        role,
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
    playerInGame: {
        hp: 0,
        movementSpeed: DEFAULT_MAX_DISPLACEMENT,
        dice: D6_ATTACK_FIELDS,
        attack: 0,
        defense: 0,
        inventory: [],
        currentPosition: { x, y },
        startPosition: { x, y },
        hasAbandonned: false,
        remainingSpeed: DEFAULT_MAX_DISPLACEMENT,
    },
});

const CORRIDOR_OF_WALLS = createMockMap({ name: 'Engineers of War', terrain: wallsAndIce });

const TRAPPED_PLAYER = createMockMap({ name: 'Trapped Player Map', terrain: closedDoorsAndIce });

const UNTRAPPED_PLAYER = createMockMap({ name: 'Untrapped Player Map', terrain: openDoorsAndIce });

const ZIG_ZAP_PATH = createMockMap({ name: 'Zig Zag Path', terrain: zigZagPath });

const ALL_GRASS_MAP = createMockMap({ name: 'Grass Only', terrain: allGrassMap });

const ALL_WATER_MAP = createMockMap({ name: 'Water Only', terrain: allWaterMap });

const WEIRD_MAP = createMockMap({ name: 'Weird Map', terrain: weirdMap });

export const MOCK_GAME_CORRIDOR = createMockGame({
    map: CORRIDOR_OF_WALLS,
});

export const MOCK_GAME_TRAPPED = createMockGame({
    map: TRAPPED_PLAYER,
});

export const MOCK_GAME_UNTRAPPED = createMockGame({
    map: UNTRAPPED_PLAYER,
});

export const MOCK_GAME_ZIG_ZAG = createMockGame({
    map: ZIG_ZAP_PATH,
});

export const MOCK_GAME_MULTIPLE_PLAYERS = createMockGame({
    map: ALL_GRASS_MAP,
});

export const MOCK_GAME_MULTIPLE_PLAYERS_WATER = createMockGame({
    map: ALL_WATER_MAP,
});

export const MOCK_GAME_WEIRD_MULTIPLE_PLAYERS = createMockGame({
    map: WEIRD_MAP,
});

export const MOCK_ROOM_GAME_CORRIDOR: RoomGame = {
    players: [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_CORRIDOR,
};

export const MOCK_ROOM_GAME_TRAPPED: RoomGame = {
    players: [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_TRAPPED,
};

export const MOCK_ROOM_UNTRAPPED: RoomGame = {
    players: [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1)],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_UNTRAPPED,
};

export const MOCK_ROOM_ZIG_ZAG: RoomGame = {
    players: [createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 2)],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_ZIG_ZAG,
};

export const MOCK_ROOM_MULTIPLE_PLAYERS: RoomGame = {
    players: [
        createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 0),
        createMockPlayer('2', 'Player2', PlayerRole.HUMAN, 0, 1),
        createMockPlayer('3', 'Player3', PlayerRole.HUMAN, 1, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_MULTIPLE_PLAYERS,
};

export const MOCK_ROOM_MULTIPLE_PLAYERS_WATER: RoomGame = {
    players: [
        createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 0),
        createMockPlayer('2', 'Player2', PlayerRole.HUMAN, 0, 1),
        createMockPlayer('3', 'Player3', PlayerRole.HUMAN, 1, 1),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_MULTIPLE_PLAYERS_WATER,
};

export const MOCK_ROOM_WEIRD_GAME: RoomGame = {
    players: [
        createMockPlayer('1', 'Player1', PlayerRole.HUMAN, 0, 1),
        createMockPlayer('2', 'Player2', PlayerRole.HUMAN, 2, 2),
        createMockPlayer('3', 'Player3', PlayerRole.HUMAN, MOCK_PLAYER_3_X, MOCK_PLAYER_3_Y),
    ],
    room: MOCK_ROOM,
    chatList: [],
    journal: [],
    isLocked: false,
    game: MOCK_GAME_WEIRD_MULTIPLE_PLAYERS,
};

export const MOCK_MOVE_DATA = {
    destination: { x: 1, y: 2 },
    playerId: 'player1',
};

export const MOCK_MOVE_RESULT = {
    dijkstraServiceOutput: {
        position: { x: 1, y: 1 },
        displacementVector: [
            { x: 1, y: 2 },
            { x: 1, y: 3 },
        ],
        remainingSpeed: 0,
    },
    hasTripped: false,
};

export const MOCK_MOVE_RESULT_TRIPPED = {
    dijkstraServiceOutput: {
        position: { x: 1, y: 1 },
        displacementVector: [
            { x: 1, y: 2 },
            { x: 1, y: 3 },
        ],
        remainingSpeed: 0,
    },
    hasTripped: true,
};

export const MOCK_MOVE_RESULT_EMPTY = {
    dijkstraServiceOutput: {
        position: { x: 1, y: 1 },
        displacementVector: [],
        remainingSpeed: 0,
    },
    hasTripped: true,
};
