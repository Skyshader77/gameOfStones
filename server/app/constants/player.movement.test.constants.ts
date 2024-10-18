import { GameMode } from '@app/interfaces/gamemode';
import { Game, GameStats } from '@app/interfaces/gameplay';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/roomGame';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Map } from '@app/model/database/map';
import { D6_ATTACK_FIELDS, PlayerRole, PlayerStatus } from '@common/interfaces/player.constants';
import { MOCK_ROOM } from './test.constants';
export const INVALID_POSITIVE_COORDINATE = 99;
export const INVALID_NEGATIVE_COORDINATE = -99;
const DEFAULT_DESCRIPTION = 'A mock map';
const DEFAULT_IMAGE_DATA = 'ajfa';
const DEFAULT_MAX_DISPLACEMENT = 5;
const DEFAULT_MAP_NAME = 'Engineers of War';
export const FIFTEEN_PERCENT = 0.15;
export const NINE_PERCENT = 0.09;
export const SLIP_PROBABILITY = 0.1;
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

const allWaterMap: TileTerrain[][] = [
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
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
    mapArray: terrain.map((row) => row.map((terrainType) => ({ terrain: terrainType, item: Item.NONE }))),
    description,
    placedItems: [],
    imageData,
    isVisible: false,
    dateOfLastModification: undefined,
});

interface CreateMockGameOptions {
    map: Map;
    mode?: GameMode;
    currentPlayer?: string;
    winner?: number;
    actionsLeft?: number;
    stats?: GameStats;
    playerStatus?: PlayerStatus;
    isDebugMode?: boolean;
    timerValue?: number;
}

const createMockGame = ({
    map,
    mode = GameMode.NORMAL,
    currentPlayer = '0',
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
    timerValue = 0,
}: CreateMockGameOptions): Game => ({
    map,
    winner,
    mode,
    currentPlayer,
    actionsLeft,
    playerStatus,
    stats,
    isDebugMode,
    timerValue,
});

const createMockPlayer = (id: string, userName: string, role: PlayerRole, x: number, y: number): Player => ({
    id,
    userName,
    role,
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
        hasAbandonned: false,
    },
});

const CORRIDOR_OF_WALLS = createMockMap({ name: 'Engineers of War', terrain: wallsAndIce });

const TRAPPED_PLAYER = createMockMap({ name: 'Trapped Player Map', terrain: closedDoorsAndIce });

const UNTRAPPED_PLAYER = createMockMap({ name: 'Untrapped Player Map', terrain: openDoorsAndIce });

const ZIG_ZAP_PATH = createMockMap({ name: 'Zig Zag Path', terrain: zigZagPath });

const ALL_WATER_MAP = createMockMap({ name: 'Water Only', terrain: allWaterMap });

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
    map: ALL_WATER_MAP,
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

export const MOCK_MOVE_DATA = {
    destination: { x: 1, y: 2 },
    playerId: 'player1',
};

export const MOCK_MOVE_RESULT = {
    displacementVector: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
    ],
    hasTripped: false,
};

export const MOCK_MOVE_RESULT_TRIPPED = {
    displacementVector: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
    ],
    hasTripped: true,
};
