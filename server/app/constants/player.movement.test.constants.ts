import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { D6_ATTACK_FIELDS, PlayerRole, PlayerStatus } from '@common/constants/player.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { MOCK_ROOM } from './test.constants';

export const CONSTANTS = {
    COORDS: {
        INVALID_POSITIVE: 99,
        INVALID_NEGATIVE: -99,
        MOCK_PLAYER_3_X: 4,
        MOCK_PLAYER_3_Y: 3
    },
    GAME: {
        DEFAULT_MAP_NAME: 'Engineers of War',
        DEFAULT_DESCRIPTION: 'A mock map',
        DEFAULT_IMAGE_DATA: 'ajfa',
        DEFAULT_MAX_DISPLACEMENT: 5,
        FIFTEEN_PERCENT: 0.15,
        NINE_PERCENT: 0.09,
        SLIP_PROBABILITY: 0.1
    }
} as const;

export const TERRAIN_PATTERNS = {
    WALLS_AND_ICE: [
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    ],
    CLOSED_DOORS_AND_ICE: [
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    ],
    OPEN_DOORS_AND_ICE: [
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    ],
    ZIG_ZAG: [
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.ICE],
        [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.ICE],
        [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.WATER],
    ],
    ALL_GRASS: [
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
    ],
    ALL_WATER: [
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    ],
    WEIRD: [
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR, TileTerrain.ICE],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR],
        [TileTerrain.OPENDOOR, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.WALL, TileTerrain.GRASS],
        [TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR],
    ]
};

const MockFactory = {
    createMap: (terrain: TileTerrain[][], name = CONSTANTS.GAME.DEFAULT_MAP_NAME): Map => ({
        name,
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: terrain.map(row => [...row]),
        description: CONSTANTS.GAME.DEFAULT_DESCRIPTION,
        placedItems: [],
        imageData: CONSTANTS.GAME.DEFAULT_IMAGE_DATA,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),

    createGame: (map: Map, options: Partial<Game> = {}): Game => ({
        map,
        winner: 0,
        mode: GameMode.NORMAL,
        currentPlayer: '0',
        actionsLeft: 1,
        playerStatus: PlayerStatus.WAITING,
        stats: {
            timeTaken: new Date(),
            percentageDoorsUsed: 0,
            numberOfPlayersWithFlag: 0,
            highestPercentageOfMapVisited: 0,
        },
        isDebugMode: false,
        timer: { 
            turnCounter: 0, 
            fightCounter: 0, 
            timerId: null, 
            timerSubject: null, 
            timerSubscription: null 
        },
        ...options
    }),

    createPlayer: (id: string, userName: string, position: Vec2): Player => ({
        playerInfo: {
            id,
            userName,
            role: PlayerRole.HUMAN,
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
            movementSpeed: CONSTANTS.GAME.DEFAULT_MAX_DISPLACEMENT,
            dice: D6_ATTACK_FIELDS,
            attack: 0,
            defense: 0,
            inventory: [],
            currentPosition: position,
            startPosition: position,
            hasAbandonned: false,
            isCurrentPlayer: false,
            remainingMovement: CONSTANTS.GAME.DEFAULT_MAX_DISPLACEMENT,
        },
    })
};

export const MOCK_MAPS = {
    CORRIDOR: MockFactory.createMap(TERRAIN_PATTERNS.WALLS_AND_ICE),
    TRAPPED: MockFactory.createMap(TERRAIN_PATTERNS.CLOSED_DOORS_AND_ICE),
    UNTRAPPED: MockFactory.createMap(TERRAIN_PATTERNS.OPEN_DOORS_AND_ICE),
    ZIG_ZAG: MockFactory.createMap(TERRAIN_PATTERNS.ZIG_ZAG),
    ALL_GRASS: MockFactory.createMap(TERRAIN_PATTERNS.ALL_GRASS),
    ALL_WATER: MockFactory.createMap(TERRAIN_PATTERNS.ALL_WATER),
    WEIRD: MockFactory.createMap(TERRAIN_PATTERNS.WEIRD),
};

export const MOCK_GAMES = {
    CORRIDOR: MockFactory.createGame(MOCK_MAPS.CORRIDOR, { currentPlayer: 'Player1' }),
    TRAPPED: MockFactory.createGame(MOCK_MAPS.TRAPPED, { currentPlayer: 'Player1' }),
    UNTRAPPED: MockFactory.createGame(MOCK_MAPS.UNTRAPPED, { currentPlayer: 'Player1' }),
    ZIG_ZAG: MockFactory.createGame(MOCK_MAPS.ZIG_ZAG, { currentPlayer: 'Player1' }),
    MULTIPLE_PLAYERS: MockFactory.createGame(MOCK_MAPS.ALL_GRASS, { currentPlayer: 'Player1' }),
    MULTIPLE_PLAYERS_WATER: MockFactory.createGame(MOCK_MAPS.ALL_WATER, { currentPlayer: 'Player1' }),
    WEIRD: MockFactory.createGame(MOCK_MAPS.WEIRD, { currentPlayer: 'Player1' }),
};

export const MOCK_ROOM_GAMES: Record<string, RoomGame> = {
    CORRIDOR: {
        players: [MockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.CORRIDOR,
    },
    TRAPPED: {
        players: [MockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.TRAPPED,
    },
    UNTRAPPED: {
        players: [MockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.UNTRAPPED,
    },
    ZIG_ZAG:{
        players: [
            MockFactory.createPlayer('1', 'Player1', { x: 2, y: 0 }),
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.ZIG_ZAG,
    },
    UNTRAPPED_TWO_PLAYERS: {
        players: [
            MockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 }),
            MockFactory.createPlayer('2', 'Player2', { x: 1, y: 1 })
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.UNTRAPPED,
    },
    MULTIPLE_PLAYERS: {
        players: [
            MockFactory.createPlayer('1', 'Player1', { x: 0, y: 0 }),
            MockFactory.createPlayer('2', 'Player2', { x: 1, y: 0 }),
            MockFactory.createPlayer('3', 'Player3', { x: 1, y: 1 })
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.MULTIPLE_PLAYERS,
    },
    MULTIPLE_PLAYERS_WATER: {
        players: [
            MockFactory.createPlayer('1', 'Player1', { x: 0, y: 0 }),
            MockFactory.createPlayer('2', 'Player2', { x: 1, y: 0 }),
            MockFactory.createPlayer('3', 'Player3', { x: 1, y: 1 })
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.MULTIPLE_PLAYERS_WATER,
    },
    WEIRD: {
        players: [
            MockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 }),
            MockFactory.createPlayer('2', 'Player2', { x: 2, y: 2 }),
            MockFactory.createPlayer('3', 'Player3', { x: CONSTANTS.COORDS.MOCK_PLAYER_3_X, y: CONSTANTS.COORDS.MOCK_PLAYER_3_Y })
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.WEIRD,
    }
};

export const MOCK_MOVEMENT = {
    DESTINATION: { x: 1, y: 2 } as Vec2,
    REACHABLE_TILES: [
        {
            position: { x: 0, y: 5 },
            remainingSpeed: 3,
            path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
        }
    ] as ReachableTile[],
    REACHABLE_TILE_TRUNCATED: {
        position: { x: 0, y: 2 },
        remainingSpeed: 3,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    REACHABLE_TILE_NO_MOVEMENT: {
        position: { x: 0, y: 2 },
        remainingSpeed: 0,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    MOVE_RESULTS: {
        NORMAL: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingSpeed: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
        },
        TRIPPED: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingSpeed: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: true,
        },
        NO_MOVEMENT: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingSpeed: 0,
                path: [Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
        }
    }
};
