import { TestBed } from '@angular/core/testing';

import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';

import { GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MapValidationService } from './map-validation.service';

import SpyObj = jasmine.SpyObj;

describe('MapValidationService', () => {
    let service: MapValidationService;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['isItemLimitReached', 'getMaxItems'], {
            currentMap: JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP)),
        });
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapValidationService],
        });
        service = TestBed.inject(MapValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should consider door and wall amount valid on an empty map', () => {
        expect(service['isDoorAndWallNumberValid'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should consider door and wall amount invalid on a map with too many walls and doors', () => {
        mapManagerServiceSpy.currentMap.mapArray = Array.from({ length: MapSize.SMALL }, (_, rowIndex) =>
            Array.from({ length: MapSize.SMALL }, () => {
                if (rowIndex < testConsts.MAX_WALL_ROW_INDEX) {
                    return { terrain: TileTerrain.WALL, item: Item.NONE };
                } else if (rowIndex >= testConsts.MAX_WALL_ROW_INDEX && rowIndex < testConsts.MAX_DOOR_ROW_INDEX) {
                    return { terrain: TileTerrain.CLOSEDDOOR, item: Item.NONE };
                } else {
                    return { terrain: TileTerrain.GRASS, item: Item.NONE };
                }
            }),
        );
        expect(service['isDoorAndWallNumberValid'](mapManagerServiceSpy.currentMap)).toEqual(false);
    });

    it('should show that a grass-only map is wholly accessible', () => {
        expect(service['isWholeMapAccessible'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should prevent a map full of walls', () => {
        expect(service['isWholeMapAccessible'](testConsts.MOCK_MAP_WALLS_ONLY)).toEqual(false);
    });

    it('should check if whole map is accessible', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.WALL;
        expect(service['isWholeMapAccessible'](mapManagerServiceSpy.currentMap)).toEqual(false);
    });

    it('should consider door surroundings valid on a map without doors', () => {
        expect(service['areDoorSurroundingsValid'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should consider door surroundings valid on a map with only valid doors', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_WALL_ROW_1][testConsts.MOCK_COL].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_WALL_ROW_2][testConsts.MOCK_COL].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_DOOR_ROW][testConsts.MOCK_COL].terrain = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should check if door surroundings are valid', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false);

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.GRASS;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false);

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 2].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false);

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.GRASS;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(true);

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].terrain = TileTerrain.GRASS;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 2].terrain = TileTerrain.GRASS;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 2][testConsts.MOCK_COL_INDEX + 1].terrain = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(true);
    });

    it('should check that all start points are placed', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX].item = Item.START;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        expect(service['areAllStartPointsPlaced']()).toEqual(false);
    });

    it('should check if flag is placed in CTF', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX].item = Item.FLAG;
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(true);
        expect(service['isFlagPlaced']()).toEqual(true);
    });

    it('should check if name is valid', () => {
        expect(service['isNameValid'](testConsts.MOCK_NEW_MAP.name)).toEqual(true);
    });

    it('should check if description is valid', () => {
        expect(service['isDescriptionValid'](testConsts.MOCK_NEW_MAP.description)).toEqual(true);
    });

    it('should validate a valid normal mode map', () => {
        mapManagerServiceSpy.getMaxItems.and.callFake(() => {
            switch (mapManagerServiceSpy.currentMap.size) {
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
                return mapManagerServiceSpy.currentMap.placedItems.includes(item);
            } else {
                const itemCount = mapManagerServiceSpy.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
                return itemCount === mapManagerServiceSpy.getMaxItems();
            }
        });

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX].item = Item.BOOST1;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].item = Item.BOOST2;

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].item = Item.START;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 1].item = Item.START;

        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST1);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST2);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.START);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.START);

        const validationResult = service.validateMap(mapManagerServiceSpy.currentMap);

        expect(validationResult.validationStatus.isMapValid).toEqual(true);
        expect(validationResult.message).toBe('');
    });

    it('should validate a valid CTF map', () => {
        mapManagerServiceSpy.currentMap.mode = GameMode.CTF;
        mapManagerServiceSpy.getMaxItems.and.callFake(() => {
            switch (mapManagerServiceSpy.currentMap.size) {
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
                return mapManagerServiceSpy.currentMap.placedItems.includes(item);
            } else {
                const itemCount = mapManagerServiceSpy.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
                return itemCount === mapManagerServiceSpy.getMaxItems();
            }
        });

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX].item = Item.BOOST1;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].item = Item.BOOST2;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 2].item = Item.FLAG;

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].item = Item.START;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX + 1].item = Item.START;

        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST1);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST2);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.FLAG);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.START);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.START);

        const validationResult = service.validateMap(mapManagerServiceSpy.currentMap);

        expect(validationResult.validationStatus.isMapValid).toEqual(true);
        expect(validationResult.message).toBe('');
    });

    it('should invalidate a partially valid map', () => {
        mapManagerServiceSpy.currentMap.mode = GameMode.NORMAL;
        mapManagerServiceSpy.getMaxItems.and.callFake(() => {
            switch (mapManagerServiceSpy.currentMap.size) {
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
                return mapManagerServiceSpy.currentMap.placedItems.includes(item);
            } else {
                const itemCount = mapManagerServiceSpy.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
                return itemCount === mapManagerServiceSpy.getMaxItems();
            }
        });

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX].item = Item.BOOST1;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX][testConsts.MOCK_COL_INDEX + 1].item = Item.BOOST2;

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_ROW_INDEX + 1][testConsts.MOCK_COL_INDEX].item = Item.START;

        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST1);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.BOOST2);
        mapManagerServiceSpy.currentMap.placedItems.push(Item.START);

        const validationResult = service.validateMap(mapManagerServiceSpy.currentMap);

        expect(validationResult.validationStatus.isMapValid).toEqual(false);
        expect(validationResult.message).not.toBe('');
    });
});
