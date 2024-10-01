import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { ValidationStatus } from '@app/interfaces/validation';
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
        _id: 'Su27FLanker',
        name: 'Game of Thrones',
        description: 'Test Map 2.5',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        dateOfLastModification: new Date('December 17, 1998 03:24:00'),
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [Item.BOOST3, Item.BOOST6, Item.BOOST4],
        isVisible: false,
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
export const mockWallRow1 = 4;
export const mockWallRow2 = 6;
export const mockDoorRow = 5;
export const mockCol = 3;

export const mockFailValidationStatus = {
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

export const mockSuccessValidationStatus = {
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

export const mockClickIndex0 = 0;
export const mockClickIndex1 = 1;
export const mockClickIndex2 = 2;
export const mockClickIndex3 = 3;
export const mockClickIndex4 = 4;
export const mockSmallMapSize = 10;
export const mockCTFGameMode = 1;

export const mockAddedBoost1: Item = Item.BOOST1;
export const mockAddedRandomItem: Item = Item.RANDOM;
export const addedItemRowIndex = 5;
export const addedItemColIndex = 5;
export const colIncrementLimit1 = 1;
export const colIncrementLimit2 = 3;
export const colIncrementLimit3 = 5;

export const maxWallRowIndex = 3;
export const maxDoorRowIndex = 6;
export const addedItemRowIndex2 = 7;
export const addedItemColIndex2 = 7;

export const addedItemRowIndex3 = 3;
export const addedItemColIndex3 = 3;

export const addedItemRowIndex4 = 2;
export const addedItemColIndex4 = 2;

export const addedItemRowIndex5 = 4;
export const addedItemColIndex5 = 4;

export const addedItemRowIndex6 = 8;
export const addedItemColIndex6 = 8;

export const addedItemRowIndex7 = 6;
export const addedItemColIndex7 = 6;

export const mockValidStatus: ValidationStatus = {
    doorAndWallNumberValid: true,
    wholeMapAccessible: true,
    allStartPointsPlaced: true,
    doorSurroundingsValid: true,
    flagPlaced: true,
    allItemsPlaced: true,
    nameValid: true,
    descriptionValid: true,
    isMapValid: true,
}

export const mockInvalidStatus: ValidationStatus = {
    doorAndWallNumberValid: false,
    wholeMapAccessible: false,
    allStartPointsPlaced: false,
    doorSurroundingsValid: false,
    flagPlaced: true,
    allItemsPlaced: false,
    nameValid: true,
    descriptionValid: true,
    isMapValid: false,
}
