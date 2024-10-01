import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { ValidationResult } from '@app/interfaces/validation';
import { Vec2 } from '@app/interfaces/vec2';
export const mockMaps: Map[] = [
    {
        _id: 'Su27FLanker',
        name: 'Game of Drones',
        description: 'Test Map 1',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        dateOfLastModification: new Date('December 17, 1995 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [Item.BOOST3, Item.BOOST2],
        isVisible: false,
        imageData: '',
    },
    {
        _id: 'F35jsf',
        name: 'Engineers of War',
        description: 'Test Map 2',
        size: MapSize.MEDIUM,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1997 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
        isVisible: true,
        imageData: '',
    },
    {
        _id: 'NabMap',
        name: 'Game of Thrones',
        description: 'Test Map 2.5',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1998 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [Item.BOOST3, Item.BOOST6, Item.BOOST4],
        isVisible: true,
        imageData: '',
    },
];

export const mockRoom: Room = {
    roomCode: 'ABCD',
};

export const mockNewMap: Map = {
    _id: 'Su27FLanker',
    name: 'NewMapTest',
    description: 'Test Map',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: Array.from({ length: MapSize.SMALL }, () =>
        Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
    ),
    placedItems: [],
    isVisible: false,
    dateOfLastModification: new Date(),
    imageData: '',
};

export const mockMapWallsOnly: CreationMap = {
    name: 'Mock Map Walls Only',
    description: 'Mock Map Walls Only',
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: Array.from({ length: MapSize.SMALL }, () =>
        Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.WALL, item: Item.NONE })),
    ),
    placedItems: [],
    imageData: '',
};

export const mockRowIndex = 0;
export const mockColIndex = 0;
export const mockPosition = { x: 0, y: 0 };
export const mockWallRow1 = 4;
export const mockWallRow2 = 6;
export const mockDoorRow = 5;
export const mockCol = 3;

export const mockFailValidationStatus: ValidationResult = {
    validationStatus: {
        doorAndWallNumberValid: false,
        wholeMapAccessible: false,
        allStartPointsPlaced: false,
        doorSurroundingsValid: false,
        flagPlaced: false,
        allItemsPlaced: false,
        nameValid: false,
        descriptionValid: false,
        isMapValid: false,
    },
    message: 'La carte est invalide.',
};

export const mockSuccessValidationStatus: ValidationResult = {
    validationStatus: {
        doorAndWallNumberValid: true,
        wholeMapAccessible: true,
        allStartPointsPlaced: true,
        doorSurroundingsValid: true,
        flagPlaced: true,
        allItemsPlaced: true,
        nameValid: true,
        descriptionValid: true,
        isMapValid: true,
    },
    message: 'La carte est valide.',
};

export const mockClickPosition0: Vec2 = { x: 0, y: 0 };
export const mockClickPosition1: Vec2 = { x: 1, y: 1 };
export const mockClickPosition2: Vec2 = { x: 2, y: 2 };
export const mockClickPosition3: Vec2 = { x: 3, y: 3 };
export const mockClickPosition4: Vec2 = { x: 4, y: 4 };
export const mockClickPosition5: Vec2 = { x: 3, y: 2 };

export const mockSmallMapSize = 10;
export const mockCTFGameMode = 1;

export const mockAddedBoost1: Item = Item.BOOST1;
export const mockAddedRandomItem: Item = Item.RANDOM;
export const colIncrementLimit1 = 1;
export const colIncrementLimit2 = 3;
export const colIncrementLimit3 = 5;

export const maxWallRowIndex = 3;
export const maxDoorRowIndex = 6;

export const addedItemPosition1: Vec2 = { x: 5, y: 5 };
export const addedItemPosition2: Vec2 = { x: 7, y: 7 };
export const addedItemPosition3: Vec2 = { x: 3, y: 3 };
export const addedItemPosition4: Vec2 = { x: 2, y: 2 };
export const addedItemPosition5: Vec2 = { x: 4, y: 4 };
export const addedItemPosition6: Vec2 = { x: 8, y: 8 };
export const addedItemPosition7: Vec2 = { x: 6, y: 6 };
