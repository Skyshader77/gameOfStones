import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { Player } from '@app/interfaces/playerPosition';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { GameMap, Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { ObjectId } from 'mongodb';

export const ROOM_CODE_LENGTH = 4;
export const INVALID_POSITIVE_COORDINATE = 99;
export const INVALID_NEGATIVE_COORDINATE = -99;
const DEFAULT_DESCRIPTION = 'A mock map';
const DEFAULT_IMAGE_DATA = 'ajfa';
const DEFAULT_MAX_DISPLACEMENT = 5;
const DEFAULT_MAP_NAME = 'Engineers of War';

export const MOCK_MAPS: Map[] = [
    {
        size: MapSize.SMALL,
        name: 'Engineers of War',
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        isVisible: true,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.OPENDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A map for the Engineers of War',
        placedItems: [],
        _id: new ObjectId(),
        imageData: 'kesdf',
    },
    {
        size: MapSize.SMALL,
        name: 'Defenders of Satabis',
        dateOfLastModification: new Date('December 18, 1995 03:24:00'),
        isVisible: false,
        mode: GameMode.CTF,
        mapArray: [
            [
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A map for the Defenders of Satabis',
        placedItems: [],
        _id: new ObjectId(),
        imageData: 'amvdvnak',
    },
];

export const MOCK_MAP_DTO: CreateMapDto = {
    name: 'Engineers of War',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: [
        [
            {
                terrain: TileTerrain.ICE,
                item: Item.BOOST1,
            },
            {
                terrain: TileTerrain.WALL,
                item: Item.BOOST2,
            },
        ],
    ],
    description: 'A map for the Engineers of War',
    placedItems: [],
    imageData: 'ajfa',
};

export const MOCK_ROOM: Room = {
    _id: new ObjectId(),
    roomCode: '1A34',
};

export const FOUR_TILED_MOCK_GAMEMAP: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 0 },
            isCurrentPlayer: true,
            maxDisplacementValue: DEFAULT_MAX_DISPLACEMENT,
        },
        {
            id: 2,
            currentPosition: { x: 1, y: 1 },
            isCurrentPlayer: false,
            maxDisplacementValue: DEFAULT_MAX_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.GRASS,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.GRASS,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A map for the Engineers of War',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};
const createMockMap = (
    name = DEFAULT_MAP_NAME,
    terrain: TileTerrain[][],
    players: Player[] = [],
    description = DEFAULT_DESCRIPTION,
    imageData = DEFAULT_IMAGE_DATA,
): GameMap => ({
    players,
    map: {
        name,
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: terrain.map((row) => row.map((terrainType) => ({ terrain: terrainType, item: Item.NONE }))),
        description,
        placedItems: [],
        imageData,
        isVisible: false,
        dateOfLastModification: undefined,
    },
});

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

const createPlayer = (id: number, x: number, y: number, isCurrentPlayer = false): Player => ({
    id,
    currentPosition: { x, y },
    isCurrentPlayer,
    maxDisplacementValue: DEFAULT_MAX_DISPLACEMENT,
});

export const CORRIDOR_OF_WALLS = createMockMap('Engineers of War', wallsAndIce, [createPlayer(1, 0, 1, true)]);

export const TRAPPED_PLAYER = createMockMap('Trapped Player Map', closedDoorsAndIce, [createPlayer(1, 0, 1, true)]);

export const UNTRAPPED_PLAYER = createMockMap('Trapped Player Map', openDoorsAndIce, [createPlayer(1, 0, 1, true)]);

export const ZIG_ZAP_PATH = createMockMap('Zig Zag Path', zigZagPath, [createPlayer(1, 0, 2, true)]);

export const MULTIPLE_PLAYERS_PATH = createMockMap('Multiple Players', allWaterMap, [
    createPlayer(1, 0, 0, true),
    createPlayer(2, 0, 1),
    createPlayer(2 + 1, 1, 1),
]);

export const LABYRINTH_PATH = createMockMap(
    'Legend of Othmane',
    [
        [TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL, TileTerrain.OPENDOOR, TileTerrain.GRASS],
        [TileTerrain.OPENDOOR, TileTerrain.ICE, TileTerrain.WATER, TileTerrain.WALL, TileTerrain.WALL],
        [TileTerrain.WALL, TileTerrain.CLOSEDDOOR, TileTerrain.GRASS, TileTerrain.ICE, TileTerrain.WATER],
        [TileTerrain.WATER, TileTerrain.WALL, TileTerrain.ICE, TileTerrain.WALL, TileTerrain.OPENDOOR],
        [TileTerrain.GRASS, TileTerrain.OPENDOOR, TileTerrain.WALL, TileTerrain.CLOSEDDOOR, TileTerrain.GRASS],
    ],
    [createPlayer(1, 0, 0, true)],
);
