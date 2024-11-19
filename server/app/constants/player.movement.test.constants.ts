import { Game } from '@app/interfaces/gameplay';
import { Player } from '@common/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { MOCK_ROOM, MOCK_TIMER } from './test.constants';
import { MOCK_GAME_STATS } from './test-stats.constants';

export const MOVEMENT_CONSTANTS = {
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
        [TileTerrain.Wall, TileTerrain.Ice, TileTerrain.Wall],
        [TileTerrain.Wall, TileTerrain.Ice, TileTerrain.Wall],
        [TileTerrain.Wall, TileTerrain.Ice, TileTerrain.Wall],
    ],
    closedDoorsAndIce: [
        [TileTerrain.ClosedDoor, TileTerrain.Ice, TileTerrain.ClosedDoor],
        [TileTerrain.ClosedDoor, TileTerrain.ClosedDoor, TileTerrain.ClosedDoor],
        [TileTerrain.ClosedDoor, TileTerrain.Ice, TileTerrain.ClosedDoor],
    ],
    openDoorsAndIce: [
        [TileTerrain.ClosedDoor, TileTerrain.Ice, TileTerrain.ClosedDoor],
        [TileTerrain.ClosedDoor, TileTerrain.OpenDoor, TileTerrain.ClosedDoor],
        [TileTerrain.ClosedDoor, TileTerrain.Ice, TileTerrain.ClosedDoor],
    ],
    zigZag: [
        [TileTerrain.Water, TileTerrain.Water, TileTerrain.Ice],
        [TileTerrain.Ice, TileTerrain.Ice, TileTerrain.Ice],
        [TileTerrain.Ice, TileTerrain.Ice, TileTerrain.Water],
    ],
    allGrass: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
    allWater: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Water)),
    allIce: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Ice)),
    weird: [
        [TileTerrain.Wall, TileTerrain.Ice, TileTerrain.Water, TileTerrain.Ice, TileTerrain.Grass],
        [TileTerrain.Grass, TileTerrain.ClosedDoor, TileTerrain.Water, TileTerrain.OpenDoor, TileTerrain.Ice],
        [TileTerrain.Wall, TileTerrain.Ice, TileTerrain.Water, TileTerrain.Grass, TileTerrain.ClosedDoor],
        [TileTerrain.OpenDoor, TileTerrain.Water, TileTerrain.Ice, TileTerrain.Wall, TileTerrain.Grass],
        [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.ClosedDoor, TileTerrain.Water, TileTerrain.OpenDoor],
    ],
};

const mockFactory = {
    createMap: (terrain: TileTerrain[][], name = MOVEMENT_CONSTANTS.game.defaultMapName): Map => ({
        name,
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: terrain.map((row) => [...row]),
        description: MOVEMENT_CONSTANTS.game.defaultDescription,
        placedItems: [],
        imageData: MOVEMENT_CONSTANTS.game.defaultImageData,
        isVisible: false,
        dateOfLastModification: undefined,
        _id: '',
    }),

    createGame: (map: Map, options: Partial<Game>): Game => ({
        map,
        winner: '',
        mode: GameMode.Normal,
        currentPlayer: '0',
        hasPendingAction: false,
        status: GameStatus.Waiting,
        stats: MOCK_GAME_STATS,
        isDebugMode: false,
        timer: MOCK_TIMER,
        isTurnChange: false,
        ...options,
    }),

    createPlayer: (id: string, userName: string, position: Vec2): Player => ({
        playerInfo: {
            id,
            userName,
            avatar: Avatar.MaleNinja,
            role: PlayerRole.Human,
        },
        playerInGame: {
            ...MOCK_PLAYER_IN_GAME,
            currentPosition: position,
            startPosition: position,
        },
    }),
};

export const MOCK_MOVEMENT_MAPS = {
    corridor: mockFactory.createMap(TERRAIN_PATTERNS.wallsAndIce),
    trapped: mockFactory.createMap(TERRAIN_PATTERNS.closedDoorsAndIce),
    untrapped: mockFactory.createMap(TERRAIN_PATTERNS.openDoorsAndIce),
    zigzag: mockFactory.createMap(TERRAIN_PATTERNS.zigZag),
    allgrass: mockFactory.createMap(TERRAIN_PATTERNS.allGrass),
    allwater: mockFactory.createMap(TERRAIN_PATTERNS.allWater),
    allice: mockFactory.createMap(TERRAIN_PATTERNS.allIce),
    weird: mockFactory.createMap(TERRAIN_PATTERNS.weird),
};

export const MOCK_GAMES = {
    corridor: mockFactory.createGame(MOCK_MOVEMENT_MAPS.corridor, { currentPlayer: 'Player1' }),
    trapped: mockFactory.createGame(MOCK_MOVEMENT_MAPS.trapped, { currentPlayer: 'Player1' }),
    untrapped: mockFactory.createGame(MOCK_MOVEMENT_MAPS.untrapped, { currentPlayer: 'Player1' }),
    zigzag: mockFactory.createGame(MOCK_MOVEMENT_MAPS.zigzag, { currentPlayer: 'Player1' }),
    multiplePlayers: mockFactory.createGame(MOCK_MOVEMENT_MAPS.allgrass, { currentPlayer: 'Player1' }),
    multiplePlayersWater: mockFactory.createGame(MOCK_MOVEMENT_MAPS.allwater, { currentPlayer: 'Player1' }),
    weird: mockFactory.createGame(MOCK_MOVEMENT_MAPS.weird, { currentPlayer: 'Player1' }),
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
            mockFactory.createPlayer('3', 'Player3', {
                x: MOVEMENT_CONSTANTS.coords.mockPlayer3XCoord,
                y: MOVEMENT_CONSTANTS.coords.mockPlayer3YCoord,
            }),
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
            remainingMovement: 3,
            path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
        },
    ] as ReachableTile[],
    reachableTilesTruncated: {
        position: { x: 0, y: 2 },
        remainingMovement: 3,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    reachableTileNoMovement: {
        position: { x: 0, y: 2 },
        remainingMovement: 0,
        path: [Direction.DOWN, Direction.DOWN],
    } as ReachableTile,
    reachableTilesAI: [
        {
            position: { x: 0, y: 1 },
            remainingMovement: 999,
            path: [Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.LEFT],
        },
        {
            position: { x: 2, y: 2 },
            remainingMovement: 999,
            path: [Direction.RIGHT, Direction.DOWN, Direction.DOWN],
        },
        {
            position: { x: 3, y: 2 },
            remainingMovement: 993,
            path: [Direction.RIGHT, Direction.DOWN, Direction.RIGHT, Direction.DOWN],
        },
    ] as ReachableTile[],
    moveResults: {
        normal: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingMovement: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: false,
        },
        AIbeforeDoor: {
            optimalPath: {
                position: { x: 2, y: 1 },
                remainingMovement: 3,
                path: [Direction.RIGHT, Direction.DOWN],
            },
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: true,
        },
        AIbeforePlayer: {
            optimalPath: {
                position: { x: 2, y: 1 },
                remainingMovement: 3,
                path: [Direction.RIGHT, Direction.DOWN],
            },
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: true,
        },
        AIExceedsMovementLimit: {
            optimalPath: {
                position: { x: 3, y: 1 },
                remainingMovement: 0,
                path: [Direction.RIGHT, Direction.DOWN, Direction.RIGHT],
            },
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: false,
        },
        tripped: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingMovement: 3,
                path: [Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN, Direction.DOWN],
            },
            hasTripped: true,
            isOnItem: false,
            isNextToInteractableObject: false,
        },
        noMovement: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                path: [Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: false,
        },
        itemNoTrip: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                path: [Direction.DOWN, Direction.DOWN],
            },
            hasTripped: false,
            isOnItem: true,
            isNextToInteractableObject: false,
        },
        itemWithTrip: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                path: [Direction.DOWN, Direction.DOWN],
            },
            hasTripped: true,
            isOnItem: true,
            isNextToInteractableObject: false,
        },
    },
};
