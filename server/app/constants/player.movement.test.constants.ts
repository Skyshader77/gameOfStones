/* eslint-disable max-lines */
import { Game } from '@app/interfaces/gameplay';
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
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { MOCK_GAME_STATS } from './test-stats.constants';
import { MOCK_ROOM, MOCK_TIMER } from './test.constants';
import { MOCK_VIRTUAL_PLAYER_STATE } from './virtual-player-test.constants';

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
        isCurrentPlayerDead: false,
        removedSpecialItems: [],
        hasPendingAction: false,
        hasSlipped: false,
        status: GameStatus.Waiting,
        stats: MOCK_GAME_STATS,
        isDebugMode: false,
        timer: MOCK_TIMER,
        virtualState: MOCK_VIRTUAL_PLAYER_STATE,
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

    createAI: (id: string, userName: string, position: Vec2): Player => ({
        playerInfo: {
            id,
            userName,
            avatar: Avatar.MaleNinja,
            role: PlayerRole.AggressiveAI,
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
    zagzig: {
        players: [mockFactory.createAI('1', 'Player1', { x: 1, y: 0 })],
        room: MOCK_ROOM,
        chatList: [],
        journal: [],
        game: MOCK_GAMES.corridor,
    },
};

export const MOCK_MOVEMENT = {
    destination: { x: 1, y: 2 } as Vec2,
    reachableTiles: [
        {
            position: { x: 0, y: 5 },
            remainingMovement: 0,
            path: [
                { direction: Direction.DOWN, remainingMovement: 4 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.DOWN, remainingMovement: 2 },
                { direction: Direction.DOWN, remainingMovement: 1 },
                { direction: Direction.DOWN, remainingMovement: 0 },
            ],
        },
    ] as ReachableTile[],
    reachableTilesTruncated: {
        position: { x: 0, y: 2 },
        remainingMovement: 3,
        path: [
            { direction: Direction.DOWN, remainingMovement: 4 },
            { direction: Direction.DOWN, remainingMovement: 3 },
        ],
    } as ReachableTile,
    reachableTileNoMovement: {
        position: { x: 0, y: 2 },
        remainingMovement: 0,
        path: [
            { direction: Direction.DOWN, remainingMovement: 1 },
            { direction: Direction.DOWN, remainingMovement: 0 },
        ],
    } as ReachableTile,
    reachableTilesAI: [
        {
            position: { x: 0, y: 1 },
            remainingMovement: 999,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.LEFT, remainingMovement: 2 },
                { direction: Direction.LEFT, remainingMovement: 1 },
            ],
        },
        {
            position: { x: 2, y: 2 },
            remainingMovement: 999,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.DOWN, remainingMovement: 1 },
            ],
        },
        {
            position: { x: 2, y: 2 },
            remainingMovement: 993,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.RIGHT, remainingMovement: 2 },
                { direction: Direction.DOWN, remainingMovement: 1 },
                { direction: Direction.LEFT, remainingMovement: 0 },
            ],
        },
    ] as ReachableTile[],
    moveResults: {
        normal: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingMovement: 3,
                cost: 5,
                path: [
                    { direction: Direction.DOWN, remainingMovement: 7 },
                    { direction: Direction.DOWN, remainingMovement: 6 },
                    { direction: Direction.DOWN, remainingMovement: 5 },
                    { direction: Direction.DOWN, remainingMovement: 4 },
                    { direction: Direction.DOWN, remainingMovement: 3 },
                ],
            },
            hasTripped: false,
            isOnItem: false,
            interactiveObject: null,
        },
        virtualPlayerBeforeDoor: {
            optimalPath: {
                position: { x: 2, y: 1 },
                remainingMovement: 3,
                cost: 4,
                path: [
                    { direction: Direction.RIGHT, remainingMovement: 5 },
                    { direction: Direction.DOWN, remainingMovement: 3 },
                ],
            },
            hasTripped: false,
            isOnItem: false,
            interactiveObject: { x: 0, y: 0 },
        },
        virtualPlayerBeforeHumanPlayer: {
            optimalPath: {
                position: { x: 2, y: 1 },
                remainingMovement: 3,
                cost: 4,
                path: [
                    { direction: Direction.RIGHT, remainingMovement: 5 },
                    { direction: Direction.DOWN, remainingMovement: 3 },
                ],
            },
            hasTripped: false,
            isOnItem: false,
            interactiveObject: { x: 0, y: 0 },
        },
        virtualPlayerExceedsMovementLimit: {
            optimalPath: {
                position: { x: 3, y: 1 },
                remainingMovement: 1,
                cost: 5,
                path: [
                    { direction: Direction.RIGHT, remainingMovement: 5 },
                    { direction: Direction.DOWN, remainingMovement: 3 },
                    { direction: Direction.RIGHT, remainingMovement: 2 },
                    { direction: Direction.DOWN, remainingMovement: 1 },
                ],
            },
            hasTripped: false,
            isOnItem: false,
            interactiveObject: null,
        },
        tripped: {
            optimalPath: {
                position: { x: 0, y: 5 },
                remainingMovement: 3,
                cost: 8,
                path: [
                    { direction: Direction.DOWN, remainingMovement: 7 },
                    { direction: Direction.DOWN, remainingMovement: 6 },
                    { direction: Direction.DOWN, remainingMovement: 5 },
                    { direction: Direction.DOWN, remainingMovement: 4 },
                    { direction: Direction.DOWN, remainingMovement: 3 },
                ],
            },
            hasTripped: true,
            isOnItem: false,
            interactiveObject: null,
        },
        noMovement: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                cost: 0,
                path: [
                    { direction: Direction.DOWN, remainingMovement: 7 },
                    { direction: Direction.DOWN, remainingMovement: 0 },
                ],
            },
            hasTripped: false,
            isOnItem: false,
            interactiveObject: null,
        },
        itemNoTrip: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                cost: 0,
                path: [
                    { direction: Direction.DOWN, remainingMovement: 7 },
                    { direction: Direction.DOWN, remainingMovement: 0 },
                ],
            },
            hasTripped: false,
            isOnItem: true,
            interactiveObject: null,
        },
        itemWithTrip: {
            optimalPath: {
                position: { x: 0, y: 2 },
                remainingMovement: 0,
                cost: 0,
                path: [
                    { direction: Direction.DOWN, remainingMovement: 7 },
                    { direction: Direction.DOWN, remainingMovement: 0 },
                ],
            },
            hasTripped: true,
            isOnItem: true,
            interactiveObject: null,
        },
    },
};
