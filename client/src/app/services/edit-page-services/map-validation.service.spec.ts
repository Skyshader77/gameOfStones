import { TestBed } from '@angular/core/testing';

import * as testConsts from '@app/constants/tests.constants';

import { MapManagerService } from './map-manager.service';
import { MapValidationService } from './map-validation.service';

import SpyObj = jasmine.SpyObj;
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MAP_ITEM_LIMIT } from '@common/constants/game-map.constants';
import { GameMode } from '@common/enums/game-mode.enum';

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
                    return TileTerrain.WALL;
                } else if (rowIndex >= testConsts.MAX_WALL_ROW_INDEX && rowIndex < testConsts.MAX_DOOR_ROW_INDEX) {
                    return TileTerrain.CLOSEDDOOR;
                } else {
                    return TileTerrain.GRASS;
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

    it('should not consider a map accessible with a tile that is blocked-off by walls', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.WALL;
        expect(service['isWholeMapAccessible'](mapManagerServiceSpy.currentMap)).toEqual(false);
    });

    it('should consider door surroundings valid on a map without doors', () => {
        expect(service['areDoorSurroundingsValid'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should consider door surroundings valid on a map with only valid doors', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_WALL_ROW_1][testConsts.MOCK_COL] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_WALL_ROW_2][testConsts.MOCK_COL] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_DOOR_ROW][testConsts.MOCK_COL] = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](testConsts.MOCK_NEW_MAP)).toEqual(true);
    });

    it('should consider a door placement invalid if it is on the edge of the map', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.CLOSEDDOOR;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 2][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door on index [1,0] with walls on [0,0] and [2,0]

        mapManagerServiceSpy.currentMap = JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP));
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_BOTTOM_ROW_INDEX - 1][testConsts.MOCK_RIGHTMOST_COL_INDEX] = TileTerrain.CLOSEDDOOR;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_BOTTOM_ROW_INDEX][testConsts.MOCK_RIGHTMOST_COL_INDEX] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_BOTTOM_ROW_INDEX - 2][testConsts.MOCK_RIGHTMOST_COL_INDEX] = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door on index [8,9] with walls on [7,9] and [9,9]

        mapManagerServiceSpy.currentMap = JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP));
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_RIGHTMOST_COL_INDEX] = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door on [0,9] corner

        mapManagerServiceSpy.currentMap = JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP));
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_BOTTOM_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door on [9,0] corner
    });

    it('should check if door surroundings are valid', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.CLOSEDDOOR;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door surrounded only by grass

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX + 2] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(false); // Door with walls on left/right/top

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.GRASS;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(true); // Door with walls on left/right and grass on top/bottom

        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX] = TileTerrain.GRASS;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 1][testConsts.MOCK_LEFTMOST_COL_INDEX + 2] = TileTerrain.GRASS;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.WALL;
        mapManagerServiceSpy.currentMap.mapArray[testConsts.MOCK_TOP_ROW_INDEX + 2][testConsts.MOCK_LEFTMOST_COL_INDEX + 1] = TileTerrain.WALL;
        expect(service['areDoorSurroundingsValid'](mapManagerServiceSpy.currentMap)).toEqual(true); // Door with walls on top/bottom and grass on left/right
    });

    it('should check that all start points are placed', () => {
        mapManagerServiceSpy.currentMap.placedItems.push({
            position: { y: testConsts.MOCK_TOP_ROW_INDEX, x: testConsts.MOCK_LEFTMOST_COL_INDEX },
            type: ItemType.START,
        });
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        expect(service['areAllStartPointsPlaced']()).toEqual(false);
    });

    it('should check if flag is placed in CTF', () => {
        mapManagerServiceSpy.currentMap.placedItems.push({
            position: { y: testConsts.MOCK_TOP_ROW_INDEX, x: testConsts.MOCK_LEFTMOST_COL_INDEX },
            type: ItemType.FLAG,
        });
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(true);
        expect(service['isFlagPlaced']()).toEqual(true);
    });

    it('should check if name is valid', () => {
        expect(service['isNameValid'](testConsts.MOCK_NEW_MAP.name)).toEqual(true);
    });

    it('should check if description is valid', () => {
        expect(service['isDescriptionValid'](testConsts.MOCK_NEW_MAP.description)).toEqual(true);
    });

    it('should return that items are not all placed on empty map', () => {
        expect(service['areAllItemsPlaced'](testConsts.MOCK_NEW_MAP)).toBe(false);
    });

    it('should return that items are all placed on full map', () => {
        mapManagerServiceSpy.getMaxItems.and.returnValue(MAP_ITEM_LIMIT[MapSize.SMALL]);
        const map = testConsts.MOCK_NEW_MAP;
        map.placedItems.push({ position: testConsts.MOCK_CLICK_POSITION_0, type: ItemType.BOOST1 });
        map.placedItems.push({ position: testConsts.MOCK_CLICK_POSITION_1, type: ItemType.BOOST2 });
        expect(service['areAllItemsPlaced'](map)).toBe(true);
    });

    it('should invalidate a partially valid map', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorAndWallSpy = spyOn<any>(service, 'isDoorAndWallNumberValid').and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessibleSpy = spyOn<any>(service, 'isWholeMapAccessible').and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startPointsSpy = spyOn<any>(service, 'areAllStartPointsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemsSpy = spyOn<any>(service, 'areAllItemsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorSurroundingsSpy = spyOn<any>(service, 'areDoorSurroundingsValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nameValidSpy = spyOn<any>(service, 'isNameValid').and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const descriptionSpy = spyOn<any>(service, 'isDescriptionValid').and.returnValue(false);

        const validationResult = service.validateMap(mapManagerServiceSpy.currentMap);

        expect(doorAndWallSpy).toHaveBeenCalled();
        expect(accessibleSpy).toHaveBeenCalled();
        expect(startPointsSpy).toHaveBeenCalled();
        expect(itemsSpy).toHaveBeenCalled();
        expect(doorSurroundingsSpy).toHaveBeenCalled();
        expect(nameValidSpy).toHaveBeenCalled();
        expect(descriptionSpy).toHaveBeenCalled();
        expect(validationResult.validationStatus.isMapValid).toEqual(false);
        expect(validationResult.message).not.toBe('');
    });

    it('should validate a fully valid map', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorAndWallSpy = spyOn<any>(service, 'isDoorAndWallNumberValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessibleSpy = spyOn<any>(service, 'isWholeMapAccessible').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startPointsSpy = spyOn<any>(service, 'areAllStartPointsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemsSpy = spyOn<any>(service, 'areAllItemsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorSurroundingsSpy = spyOn<any>(service, 'areDoorSurroundingsValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nameValidSpy = spyOn<any>(service, 'isNameValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const descriptionSpy = spyOn<any>(service, 'isDescriptionValid').and.returnValue(true);

        const validationResult = service.validateMap(mapManagerServiceSpy.currentMap);

        expect(doorAndWallSpy).toHaveBeenCalled();
        expect(accessibleSpy).toHaveBeenCalled();
        expect(startPointsSpy).toHaveBeenCalled();
        expect(itemsSpy).toHaveBeenCalled();
        expect(doorSurroundingsSpy).toHaveBeenCalled();
        expect(nameValidSpy).toHaveBeenCalled();
        expect(descriptionSpy).toHaveBeenCalled();
        expect(validationResult.validationStatus.isMapValid).toEqual(true);
        expect(validationResult.message).toBe('');
    });

    it('should validate a fully valid map with a flag in ctf mode', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorAndWallSpy = spyOn<any>(service, 'isDoorAndWallNumberValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessibleSpy = spyOn<any>(service, 'isWholeMapAccessible').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startPointsSpy = spyOn<any>(service, 'areAllStartPointsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemsSpy = spyOn<any>(service, 'areAllItemsPlaced').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doorSurroundingsSpy = spyOn<any>(service, 'areDoorSurroundingsValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nameValidSpy = spyOn<any>(service, 'isNameValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const descriptionSpy = spyOn<any>(service, 'isDescriptionValid').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flagSpy = spyOn<any>(service, 'isFlagPlaced').and.returnValue(true);

        const map = mapManagerServiceSpy.currentMap;
        map.mode = GameMode.CTF;

        const validationResult = service.validateMap(map);

        expect(doorAndWallSpy).toHaveBeenCalled();
        expect(accessibleSpy).toHaveBeenCalled();
        expect(startPointsSpy).toHaveBeenCalled();
        expect(itemsSpy).toHaveBeenCalled();
        expect(doorSurroundingsSpy).toHaveBeenCalled();
        expect(nameValidSpy).toHaveBeenCalled();
        expect(descriptionSpy).toHaveBeenCalled();
        expect(flagSpy).toHaveBeenCalled();
        expect(validationResult.validationStatus.isMapValid).toEqual(true);
        expect(validationResult.message).toBe('');
    });
});
