import { MapSize } from '@common/enums/map-size.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { CreationMap } from '@common/interfaces/map';
import { RawMapData } from '@app/interfaces/raw-map-data';

export const MOCK_VALID_JSON_DATA = {
    name: 'Mock Valid Creation Map',
    description: 'Mock Valid Creation Map',
    size: 10,
    mode: 0,
    mapArray: [
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
    ],
    placedItems: [
        { position: { x: 0, y: 0 }, type: 'SapphireFins' },
        { position: { x: 1, y: 1 }, type: 'GlassStone' },
        { position: { x: 2, y: 2 }, type: 'Start' },
        { position: { x: 3, y: 3 }, type: 'Start' },
    ],
    imageData: '',
};

export const MOCK_VALID_JSON_DATA_WITH_EXTRA_FIELDS = {
    name: 'Mock Valid Creation Map',
    description: 'Mock Valid Creation Map',
    size: 10,
    mode: 0,
    mapArray: [
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
        ['Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass', 'Grass'],
    ],
    placedItems: [
        { position: { x: 0, y: 0 }, type: 'SapphireFins' },
        { position: { x: 1, y: 1 }, type: 'GlassStone' },
        { position: { x: 2, y: 2 }, type: 'Start' },
        { position: { x: 3, y: 3 }, type: 'Start' },
    ],
    imageData: '',
    extraField: '',
};

type CreationMapMap = { [key: string]: CreationMap };
export const MOCK_CREATION_MAPS: CreationMapMap = {
    validMap: {
        name: 'Mock Valid Creation Map',
        description: 'Mock Valid Creation Map',
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidMapSize: {
        name: 'Mock Invalid Creation Map',
        description: 'Mock Invalid Creation Map with invalid size',
        size: MapSize.Small + 1,
        mode: GameMode.Normal,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidMode: {
        name: 'Mock Invalid Creation Map',
        description: 'Mock Invalid Creation Map with invalid game mode',
        size: MapSize.Small,
        mode: GameMode.CTF + 1,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidRows: {
        name: 'Mock Invalid Creation Map with invalid Row Size',
        description: 'Mock Invalid Creation Map with invalid row size (more rows than allowed)',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small + 1 }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidCols: {
        name: 'Mock Invalid Creation Map with invalid Column Size',
        description: 'Mock Invalid Creation Map with invalid column size (more columns than allowed)',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small + 1 }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidTileNumber: {
        name: 'Mock Invalid Creation Map with invalid tile type',
        description: 'Mock Invalid Creation Map with invalid tile type (tile is out of bounds)',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.ClosedDoor + 1)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.Flag },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidItemNumber: {
        name: 'Mock Invalid Creation Map with invalid item type',
        description: 'Mock Invalid Creation Map with invalid item type (item is out of bounds)',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.Flag + 1 },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidItemRange: {
        name: 'Mock Invalid Creation Map with item out of bounds',
        description: 'Mock Invalid Creation Map with invalid item position (item out of bounds)',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: MapSize.Small }, type: ItemType.Flag },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidSuperposedItems: {
        name: 'Mock Invalid Creation Map with two items on the same tile',
        description: 'Mock Invalid Creation Map with two items on the same tile',
        size: MapSize.Small,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.Flag },
            { position: { x: 0, y: 0 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
            { position: { x: 3, y: 3 }, type: ItemType.Start },
        ],
        imageData: '',
    },

    invalidMapMissingStart: {
        name: 'Mock Valid Creation Map',
        description: 'Mock Valid Creation Map',
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
        placedItems: [
            { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
            { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
            { position: { x: 2, y: 2 }, type: ItemType.Start },
        ],
        imageData: '',
    },
};

export const MOCK_RAW_MAP_DATA: RawMapData = {
    name: 'Mock Creation Map',
    description: 'This is a mock creation map for testing purposes.',
    size: MapSize.Small,
    mode: GameMode.Normal,
    mapArray: [
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
    ],
    placedItems: [
        { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
        { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
        { position: { x: 2, y: 2 }, type: ItemType.Start },
        { position: { x: 3, y: 3 }, type: ItemType.Start },
    ],
    imageData: '',
};

export const MOCK_INVALID_RAW_MAP_DATA: RawMapData = {
    name: '',
    description: 'This is a mock creation map for testing purposes.',
    size: MapSize.Small,
    mode: GameMode.Normal,
    mapArray: [
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
        Array(MapSize.Small).fill(TileTerrain.Grass),
    ],
    placedItems: [
        { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
        { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
        { position: { x: 2, y: 2 }, type: ItemType.Start },
        { position: { x: 3, y: 3 }, type: ItemType.Start },
    ],
    imageData: '',
};

export const MOCK_ID = '123';
