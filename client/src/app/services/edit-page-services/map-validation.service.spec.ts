import { TestBed } from '@angular/core/testing';
import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MapValidationService } from './map-validation.service';
import * as consts from '@app/constants/edit-page-consts';
import SpyObj = jasmine.SpyObj;

describe('MapValidationService', () => {
    let service: MapValidationService;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;

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

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['isItemLimitReached', 'getMaxItems']);
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapValidationService],
        });
        service = TestBed.inject(MapValidationService);
    });

    it('should validate a CTF map', () => {
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
            
        })

        mockCTFMap.mapArray[0][0].item = Item.BOOST1;
        mockCTFMap.mapArray[0][1].item = Item.BOOST2;
        mockCTFMap.mapArray[0][2].item = Item.FLAG;

        mockCTFMap.mapArray[1][0].item = Item.START;
        mockCTFMap.mapArray[1][1].item = Item.START;

        mockCTFMap.placedItems.push(Item.BOOST1);
        mockCTFMap.placedItems.push(Item.BOOST2);
        mockCTFMap.placedItems.push(Item.FLAG);
        mockCTFMap.placedItems.push(Item.START);
        mockCTFMap.placedItems.push(Item.START);
        
        const validationResult = service.validateMap(mockCTFMap, mockCTFMap.name, mockCTFMap.description);
        for (const [key, value] of Object.entries(validationResult)) {
            console.log(`${key}: ${value}`);
            expect(value).toEqual(true);
          }
    });

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
            
        })

        mockMapGrassOnly.mapArray[0][0].item = Item.BOOST1;
        mockMapGrassOnly.mapArray[0][1].item = Item.BOOST2;


        mockMapGrassOnly.mapArray[1][0].item = Item.START;
        mockMapGrassOnly.mapArray[1][1].item = Item.START;

        mockMapGrassOnly.placedItems.push(Item.BOOST1);
        mockMapGrassOnly.placedItems.push(Item.BOOST2);
        mockMapGrassOnly.placedItems.push(Item.START);
        mockMapGrassOnly.placedItems.push(Item.START);
        
        const validationResult = service.validateMap(mockMapGrassOnly, mockMapGrassOnly.name, mockMapGrassOnly.description);
        for (const [key, value] of Object.entries(validationResult)) {
            console.log(`${key}: ${value}`);
            expect(value).toEqual(true);
          }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should show that a grass-only map is wholly accessible', () => {
        expect(service.isWholeMapAccessible(mockMapGrassOnly)).toEqual(true);
    });

    it('should prevent a map full of walls', () => {
        expect(service.isWholeMapAccessible(mockWallOnlyMap)).toEqual(false);
    });

    it('should check if whole map is accessible', () => {
        const mockMapNotWhollyAccessible: CreationMap = {
            name: 'Mock map that has inaccessible tiles',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: Array.from({ length: MapSize.SMALL }, () =>
                Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
            ),
            placedItems: [],
        };
        mockMapNotWhollyAccessible.mapArray[0][1].terrain = TileTerrain.WALL;
        mockMapNotWhollyAccessible.mapArray[1][0].terrain = TileTerrain.WALL;
        mockMapNotWhollyAccessible.mapArray[1][1].terrain = TileTerrain.WALL;
        expect(service.isWholeMapAccessible(mockMapNotWhollyAccessible)).toEqual(false);
    });

    it('should consider door surrondings valid on a map without doors', () => {
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door surrondings valid on a map with only valid doors', () => {
        const mockMapValidDoors: CreationMap = {
            name: 'Mock Map Valid Doors',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        const mockWallRow1 = 4;
        const mockWallRow2 = 6;
        const mockDoorRow = 5;
        const mockCol = 3;
        mockMapValidDoors.mapArray[mockWallRow1][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockWallRow2][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockDoorRow][mockCol].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door and wall amount valid on an empty map', () => {
        expect(service.isDoorAndWallNumberValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door and wall amount invalid on an map with too many walls and doors', () => {
        const mockMapInvalidDoorAndWallNumber: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        for (let rowIndex = 0; rowIndex < mockMapGrassOnly.size / 2; rowIndex++) {
            for (let colIndex = 0; colIndex < mockMapGrassOnly.size; colIndex++) {
                mockMapInvalidDoorAndWallNumber.mapArray[rowIndex][colIndex].terrain =
                    rowIndex + (colIndex % 2) === 0 ? TileTerrain.WALL : TileTerrain.CLOSEDDOOR; // Fill a quarter of the map with walls, and another quarter with doors, making it 50% walls/doors
            }
        }
        expect(service.isDoorAndWallNumberValid(mockMapInvalidDoorAndWallNumber)).toEqual(false);
    });

    it('should check if door is on edge', () => {
        const mockMapDoorOnEdge: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        mockMapDoorOnEdge.mapArray[0][0].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.isDoorOnEdge(0, 0, MapSize.SMALL)).toEqual(true);
    });

    it('should check if a door is between two walls', () => {
        const mockMapDoorBetweenWalls: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        mockMapDoorBetweenWalls.mapArray[0][1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.isDoorBetweenTwoWalls(0, 1, mockMapDoorBetweenWalls)).toEqual(false);
    });

    it('should check if a door is between two walls', () => {
        const mockMapDoorBetweenWalls: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        mockMapDoorBetweenWalls.mapArray[1][0].terrain = TileTerrain.CLOSEDDOOR;
        mockMapDoorBetweenWalls.mapArray[0][0].terrain = TileTerrain.WALL;
        mockMapDoorBetweenWalls.mapArray[2][0].terrain = TileTerrain.WALL;
        expect(service.isDoorBetweenTwoWalls(1, 0, mockMapDoorBetweenWalls)).toEqual(true);
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

        mockInvalidMap.mapArray[0][1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[0][1].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[1][1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[1][0].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[1][2].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[0][1].terrain = TileTerrain.WALL;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(false);
        mockInvalidMap.mapArray[0][1].terrain = TileTerrain.GRASS;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(true);
        mockInvalidMap.mapArray[1][0].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[1][2].terrain = TileTerrain.GRASS;
        mockInvalidMap.mapArray[0][1].terrain = TileTerrain.WALL;
        mockInvalidMap.mapArray[2][1].terrain = TileTerrain.WALL;
        expect(service.areDoorSurroundingsValid(mockInvalidMap)).toEqual(true);
    });

    it('should check that all start points are placed', () => {
        mockMapGrassOnly.mapArray[0][0].item = Item.START;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        expect(service.areAllStartPointsPlaced()).toEqual(false);
    });

    it('should check if flag is placed in CTF', () => {
        mockMapGrassOnly.mapArray[0][0].item = Item.FLAG;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(true);
        expect(service.isFlagPlaced()).toEqual(true);
    });

    it('should check if name is valid', () => {
        expect(service.isNameValid(mockMapGrassOnly.name)).toEqual(true);
    });

    it('should check if description is valid', () => {
        expect(service.isDescriptionValid(mockMapGrassOnly.description)).toEqual(true);
    });


});
