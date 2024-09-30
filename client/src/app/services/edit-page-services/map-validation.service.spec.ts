import { TestBed } from '@angular/core/testing';

import * as consts from '@app/constants/edit-page-consts';

import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MapValidationService } from './map-validation.service';

import SpyObj = jasmine.SpyObj;

describe('MapValidationService', () => {
    let service: MapValidationService;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const mockRowIndex = 0;
    const mockColIndex = 0;

    const mockMapGrassOnly: CreationMap = {
        name: 'Mock Map Grass Only',
        description: 'Mock Map Grass Only',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    const mockWallOnlyMap: CreationMap = {
        name: 'Mock Map Walls Only',
        description: 'Mock Map Walls Only',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.WALL, item: Item.NONE })),
        ),
        placedItems: [],
    };

    const mockMapInvalidDoorAndWallNumber: CreationMap = {
        name: 'Mock Map Invalid Doors And Walls',
        description: 'Invalid doors and walls',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
        placedItems: [],
    };

    const mockMapNotWhollyAccessible: CreationMap = {
        name: 'Mock map that has inaccessible tiles',
        description: 'Map with inacessible tiles',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    const mockMapValidDoors: CreationMap = {
        name: 'Mock Map Valid Doors',
        description: 'Map to check valid doors',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
        placedItems: [],
    };

    const mockCTFMap: CreationMap = {
        name: 'Mock CTF Map',
        description: 'Mock CTF Map',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['isItemLimitReached', 'getMaxItems']);
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapValidationService],
        });
        service = TestBed.inject(MapValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // isDoorAndWallNumberValid()
    it('should consider door and wall amount valid on an empty map', () => {
        expect(service.isDoorAndWallNumberValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door and wall amount invalid on an map with too many walls and doors', () => {
        for (let rowIndex = 0; rowIndex < mockMapGrassOnly.size / 2; rowIndex++) {
            for (let colIndex = 0; colIndex < mockMapGrassOnly.size; colIndex++) {
                mockMapInvalidDoorAndWallNumber.mapArray[rowIndex][colIndex].terrain =
                    rowIndex + (colIndex % 2) === 0 ? TileTerrain.WALL : TileTerrain.CLOSEDDOOR; // Fill a quarter of the map with walls, and another quarter with doors, making it 50% walls/doors
            }
        }
        expect(service.isDoorAndWallNumberValid(mockMapInvalidDoorAndWallNumber)).toEqual(false);
    });

    // isWholeMapAccessible()
    it('should show that a grass-only map is wholly accessible', () => {
        expect(service.isWholeMapAccessible(mockMapGrassOnly)).toEqual(true);
    });

    it('should prevent a map full of walls', () => {
        expect(service.isWholeMapAccessible(mockWallOnlyMap)).toEqual(false);
    });

    it('should check if whole map is accessible', () => {
        mockMapNotWhollyAccessible.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.WALL;
        mockMapNotWhollyAccessible.mapArray[mockRowIndex + 1][mockColIndex].terrain = TileTerrain.WALL;
        mockMapNotWhollyAccessible.mapArray[mockRowIndex + 1][mockColIndex + 1].terrain = TileTerrain.WALL;
        expect(service.isWholeMapAccessible(mockMapNotWhollyAccessible)).toEqual(false);
    });

    // TODO
    // floodFill()
    // it('should handle empty queue', () => {
    //     const initialRow = 0; // Any starting row
    //     const initialCol = 0; // Any starting column
    //     const mockMap = {
    //         name: 'mock map',
    //         description: 'just a mock map',
    //         mode: GameMode.NORMAL,
    //         size: 5, // Example size
    //         mapArray: Array.from(
    //             { length: 5 },
    //             () => Array.from({ length: 5 }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })), // Adjust terrain as needed
    //         ),
    //         placedItems: [],
    //     };
    //     const visited = Array.from({ length: mockMap.size }, () => Array(mockMap.size).fill(false));
    //     visited[initialRow][initialCol] = false; // Ensure this cell has not been visited

    //     // Call the floodFill function
    //     service.floodFill(initialRow, initialCol, visited, mockMap);

    //     // Check that the initial position was marked as visited
    //     expect(visited[initialRow][initialCol]).toBe(true);

    //     // Check that the queue empties out after processing
    //     // Since the map has no walls, all valid neighbors would be visited.
    //     // However, since we have only one tile marked as visited, we expect the queue
    //     // to finish after that tile.

    //     // Here we assert that no additional tiles were visited since they are not set up.
    //     expect(visited[1][0]).toBe(false); // Down
    //     expect(visited[0][1]).toBe(false); // Right
    //     expect(visited[-1][0]).toBe(false); // Up (out of bounds)
    //     expect(visited[0][-1]).toBe(false); // Left (out of bounds)
    // });

    // areDoorSurroundingsValid(), isDoorBetweenTwoTerrainTiles(), isDoorOnEdge(), isDoorBetweenTwoWalls()
    it('should consider door surrondings valid on a map without doors', () => {
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door surrondings valid on a map with only valid doors', () => {
        const mockWallRow1 = 4;
        const mockWallRow2 = 6;
        const mockDoorRow = 5;
        const mockCol = 3;
        mockMapValidDoors.mapArray[mockWallRow1][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockWallRow2][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockDoorRow][mockCol].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should check if door surroundings are valid', () => {
        const mockInvalidMap: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };

        mockInvalidMap.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[mockRowIndex + 1][mockColIndex + 1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[mockRowIndex + 1][mockColIndex].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[mockRowIndex + 1][mockColIndex + 2].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.WALL;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.GRASS;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(true);
        mockInvalidMap.mapArray[mockRowIndex + 1][mockColIndex].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[mockRowIndex + 1][mockColIndex + 2].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[mockRowIndex][mockColIndex + 1].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[mockRowIndex + 2][mockColIndex + 1].terrain = TileTerrain.WALL;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(true);
    });

    // areAllStartPointsPlaced()
    it('should check that all start points are placed', () => {
        mockMapGrassOnly.mapArray[mockRowIndex][mockColIndex].item = Item.START;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        expect(service.areAllStartPointsPlaced()).toEqual(false);
    });

    // areAllItemsPlaced()
    // isFlagPlaced()
    it('should check if flag is placed in CTF', () => {
        mockMapGrassOnly.mapArray[mockRowIndex][mockColIndex].item = Item.FLAG;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(true);
        expect(service.isFlagPlaced()).toEqual(true);
    });

    // isNameValid()
    it('should check if name is valid', () => {
        expect(service.isNameValid(mockMapGrassOnly.name)).toEqual(true);
    });

    // isDescriptionValid()
    it('should check if description is valid', () => {
        expect(service.isDescriptionValid(mockMapGrassOnly.description)).toEqual(true);
    });

    // validateMap()
    it('should validate a regular map', () => {
        mapManagerServiceSpy.getMaxItems.and.callFake(() => {
            switch (mockMapGrassOnly.size) {
                case MapSize.SMALL:
                    return consts.SMALL_MAP_ITEM_LIMIT;
                case MapSize.MEDIUM:
                    return consts.MEDIUM_MAP_ITEM_LIMIT;
                case MapSize.LARGE:
                    return consts.LARGE_MAP_ITEM_LIMIT;
            }
        });

        mapManagerServiceSpy.isItemLimitReached.and.callFake((item: Item) => {
            if (item !== Item.RANDOM && item !== Item.START) {
                return mockMapGrassOnly.placedItems.includes(item);
            } else {
                const itemCount = mockMapGrassOnly.placedItems.filter((placedItem) => placedItem === item).length;
                return itemCount === mapManagerServiceSpy.getMaxItems();
            }
        });

        mockMapGrassOnly.mapArray[mockRowIndex][mockColIndex].item = Item.BOOST1;
        mockMapGrassOnly.mapArray[mockRowIndex][mockColIndex + 1].item = Item.BOOST2;

        mockMapGrassOnly.mapArray[mockRowIndex + 1][mockColIndex].item = Item.START;
        mockMapGrassOnly.mapArray[mockRowIndex + 1][mockColIndex + 1].item = Item.START;

        mockMapGrassOnly.placedItems.push(Item.BOOST1);
        mockMapGrassOnly.placedItems.push(Item.BOOST2);
        mockMapGrassOnly.placedItems.push(Item.START);
        mockMapGrassOnly.placedItems.push(Item.START);

        expect(service.validateMap(mockMapGrassOnly).isMapValid).toEqual(true);
    });

    it('should validate a CTF map', () => {
        mapManagerServiceSpy.getMaxItems.and.callFake(() => {
            switch (mockCTFMap.size) {
                case MapSize.SMALL:
                    return consts.SMALL_MAP_ITEM_LIMIT;
                case MapSize.MEDIUM:
                    return consts.MEDIUM_MAP_ITEM_LIMIT;
                case MapSize.LARGE:
                    return consts.LARGE_MAP_ITEM_LIMIT;
            }
        });

        mapManagerServiceSpy.isItemLimitReached.and.callFake((item: Item) => {
            if (item !== Item.RANDOM && item !== Item.START) {
                return mockCTFMap.placedItems.includes(item);
            } else {
                const itemCount = mockCTFMap.placedItems.filter((placedItem) => placedItem === item).length;
                return itemCount === mapManagerServiceSpy.getMaxItems();
            }
        });

        mockCTFMap.mapArray[mockRowIndex][mockColIndex].item = Item.BOOST1;
        mockCTFMap.mapArray[mockRowIndex][mockColIndex + 1].item = Item.BOOST2;
        mockCTFMap.mapArray[mockRowIndex][mockColIndex + 2].item = Item.FLAG;

        mockCTFMap.mapArray[mockRowIndex + 1][mockColIndex].item = Item.START;
        mockCTFMap.mapArray[mockRowIndex + 1][mockColIndex + 1].item = Item.START;

        mockCTFMap.placedItems.push(Item.BOOST1);
        mockCTFMap.placedItems.push(Item.BOOST2);
        mockCTFMap.placedItems.push(Item.FLAG);
        mockCTFMap.placedItems.push(Item.START);
        mockCTFMap.placedItems.push(Item.START);

        expect(service.validateMap(mockCTFMap).isMapValid).toEqual(true);
    });
});
