import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { D6_ATTACK_FIELDS, PlayerRole } from '@common/constants/player.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { MOCK_ROOM } from './test.constants';
import { GameStatus } from '@common/enums/game-status.enum';

export const CONSTANTS = {
    coords: {
        invalidPositive: 99,
        invalidNegative: -99,
        mockPlayer3XCoord: 4,
        mockPlayer3YCoord: 3,
    },
    game: {
        defaultMapName: 'Engineers of War',
        defaultDescription: 'A mock map',
        defaultImageData: 'ajfa',
        defaultMaxDisplacement: 5,
        fifteenPercent: 0.15,
        ninePercent: 0.09,
        slipProbability: 0.1,
    },
} as const;

export const TERRAIN_PATTERNS = {
    wallsAndIce: [
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL],
    ],
    closedDoorsAndIce: [
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    ],
    openDoorsAndIce: [
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.CLOSEDDOOR],
        [TileTerrain.CLOSEDDOOR, TileTerrain.ICE, TileTerrain.CLOSEDDOOR],
    ],
    zigZag: [
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.ICE],
        [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.ICE],
        [TileTerrain.ICE, TileTerrain.ICE, TileTerrain.WATER],
    ],
    allGrass: [
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
    ],
    allWater: [
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
        [TileTerrain.WATER, TileTerrain.WATER, TileTerrain.WATER],
    ],
    weird: [
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR, TileTerrain.ICE],
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR],
        [TileTerrain.OPENDOOR, TileTerrain.WATER, TileTerrain.ICE, TileTerrain.WALL, TileTerrain.GRASS],
        [TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.CLOSEDDOOR, TileTerrain.WATER, TileTerrain.OPENDOOR],
    ],
};

const mockFactory = {
    createMap: (terrain: TileTerrain[][], name = CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: terrain.map((row) => [...row]),
        description: CONSTANTS.game.defaultDescription,
        placedItems: [],
        imageData: CONSTANTS.game.defaultImageData,
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
        hasPendingAction: false,
        status: GameStatus.Waiting,
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
            isTurnChange: false,
            timerId: null,
            timerSubject: null,
            timerSubscription: null,
        },
        ...options,
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
            movementSpeed: CONSTANTS.game.defaultMaxDisplacement,
            dice: D6_ATTACK_FIELDS,
            attack: 0,
            defense: 0,
            inventory: [],
            currentPosition: position,
            startPosition: position,
            hasAbandonned: false,
            isCurrentPlayer: false,
            remainingMovement: CONSTANTS.game.defaultMaxDisplacement,
        },
    }),
};

export const MOCK_MAPS = {
    corridor: mockFactory.createMap(TERRAIN_PATTERNS.wallsAndIce),
    trapped: mockFactory.createMap(TERRAIN_PATTERNS.closedDoorsAndIce),
    untrapped: mockFactory.createMap(TERRAIN_PATTERNS.openDoorsAndIce),
    zigzag: mockFactory.createMap(TERRAIN_PATTERNS.zigZag),
    allgrass: mockFactory.createMap(TERRAIN_PATTERNS.allGrass),
    allwater: mockFactory.createMap(TERRAIN_PATTERNS.allWater),
    weird: mockFactory.createMap(TERRAIN_PATTERNS.weird),
};

export const MOCK_GAMES = {
    corridor: mockFactory.createGame(MOCK_MAPS.corridor, { currentPlayer: 'Player1' }),
    trapped: mockFactory.createGame(MOCK_MAPS.trapped, { currentPlayer: 'Player1' }),
    untrapped: mockFactory.createGame(MOCK_MAPS.untrapped, { currentPlayer: 'Player1' }),
    zigzag: mockFactory.createGame(MOCK_MAPS.zigzag, { currentPlayer: 'Player1' }),
    multiplePlayers: mockFactory.createGame(MOCK_MAPS.allgrass, { currentPlayer: 'Player1' }),
    multiplePlayersWater: mockFactory.createGame(MOCK_MAPS.allwater, { currentPlayer: 'Player1' }),
    weird: mockFactory.createGame(MOCK_MAPS.weird, { currentPlayer: 'Player1' }),
};

export const MOCK_ROOM_GAMES: Record<string, RoomGame> = {
    corridor: {
        players: [mockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.corridor,
    },
    trapped: {
        players: [mockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.trapped,
    },
    untrapped: {
        players: [mockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.untrapped,
    },
    zigzag: {
        players: [mockFactory.createPlayer('1', 'Player1', { x: 2, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.zigzag,
    },
    untrappedTwoPlayers: {
        players: [mockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 }), mockFactory.createPlayer('2', 'Player2', { x: 1, y: 1 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.untrapped,
    },
    multiplePlayers: {
        players: [
            mockFactory.createPlayer('1', 'Player1', { x: 0, y: 0 }),
            mockFactory.createPlayer('2', 'Player2', { x: 1, y: 0 }),
            mockFactory.createPlayer('3', 'Player3', { x: 1, y: 1 }),
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.multiplePlayers,
    },
    multiplePlayersWater: {
        players: [
            mockFactory.createPlayer('1', 'Player1', { x: 0, y: 0 }),
            mockFactory.createPlayer('2', 'Player2', { x: 1, y: 0 }),
            mockFactory.createPlayer('3', 'Player3', { x: 1, y: 1 }),
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.multiplePlayersWater,
    },
    weird: {
        players: [
            mockFactory.createPlayer('1', 'Player1', { x: 1, y: 0 }),
            mockFactory.createPlayer('2', 'Player2', { x: 2, y: 2 }),
            mockFactory.createPlayer('3', 'Player3', { x: CONSTANTS.coords.mockPlayer3XCoord, y: CONSTANTS.coords.mockPlayer3YCoord }),
        ],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.weird,
    },
};

export const MOCK_MOVEMENT = {
    destination: { x: 1, y: 2 } as Vec2,
    reachableTiles: [
        {
            position: { x: 0, y: 5 },
            remainingSpeed: 3,
            path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
        },
    ] as ReachableTile[],
    reachableTilesTruncated: {
        position: { x: 0, y: 2 },
        remainingSpeed: 3,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    reachableTileNoMovement: {
        position: { x: 0, y: 2 },
        remainingSpeed: 0,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    moveResults: {
        normal: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingSpeed: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
        },
        tripped: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingSpeed: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: true,
        },
        noMovement: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingSpeed: 0,
                path: [Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
        },
    },
};
