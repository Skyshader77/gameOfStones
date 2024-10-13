import { GameMode } from '@app/interfaces/gamemode';
import { Item } from '@app/interfaces/item';
import { MapSize } from '@app/interfaces/mapSize';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { GameMap, Map } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { CreateMapDto } from '@app/model/dto/map/create-map.dto';
import { ObjectId } from 'mongodb';

export const ROOM_CODE_LENGTH = 4;
export const INVALID_POSITIVE_COORDINATE = 99;
export const INVALID_NEGATIVE_COORDINATE = -99;
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

const MAX_TILE_DISPLACEMENT = 5;
export const FOUR_TILED_MOCK_GAMEMAP: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 0 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
        {
            id: 2,
            currentPosition: { x: 1, y: 1 },
            isCurrentPlayer: false,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
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

export const CORRIDOR_OF_WALLS: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 1 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WALL,
                    item: Item.NONE,
                },
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
        description: 'A mock map with closed Doors',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};

export const TRAPPED_PLAYER: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 1 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A mock map with closed Doors trapping the player',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};

export const UNTRAPPED_PLAYER: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 1 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.OPENDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.CLOSEDDOOR,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A mock map with an untrapped player',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};

export const ZIG_ZAP_PATH: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 2 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.ICE,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A mock map with a zig zap pattern srrounded by water',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};

export const MULTIPLE_PLAYERS_PATH: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 0 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
        {
            id: 2,
            currentPosition: { x: 0, y: 1 },
            isCurrentPlayer: false,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
        {
            id: 3,
            currentPosition: { x: 1, y: 1 },
            isCurrentPlayer: false,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A mock map with mutiple players in it',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};

export const LABYRINTH_PATH: GameMap = {
    players: [
        {
            id: 1,
            currentPosition: { x: 0, y: 0 },
            isCurrentPlayer: true,
            maxDisplacementValue: MAX_TILE_DISPLACEMENT,
        },
    ],
    map: {
        name: 'Engineers of War',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
            [
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
                {
                    terrain: TileTerrain.WATER,
                    item: Item.NONE,
                },
            ],
        ],
        description: 'A mock map with mutiple players in it',
        placedItems: [],
        imageData: 'ajfa',
        isVisible: false,
        dateOfLastModification: undefined,
    },
};
