/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import * as editPageConsts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';
import { ValidationResult } from '@app/interfaces/validation';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { LARGE_MAP_ITEM_LIMIT, SMALL_MAP_ITEM_LIMIT } from '@common/constants/game-map.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
import { of, throwError } from 'rxjs';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;

describe('MapManagerService', () => {
    let service: MapManagerService;
    let mapAPIServiceSpy: SpyObj<MapAPIService>;
    let modalMessageSpy: SpyObj<ModalMessageService>;
    let renderingSpy: SpyObj<RenderingService>;
    let renderingStateSpy: SpyObj<RenderingStateService>;

    beforeEach(async () => {
        mapAPIServiceSpy = jasmine.createSpyObj('MapAPIService', ['getMapById', 'updateMap', 'createMap']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.MOCK_NEW_MAP));
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showMessage']);
        renderingSpy = jasmine.createSpyObj('RenderingService', ['renderScreenshot']);
        renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], {
            map: {},
        });

        await TestBed.configureTestingModule({
            providers: [
                { provide: MapAPIService, useValue: mapAPIServiceSpy },
                { provide: ModalMessageService, useValue: modalMessageSpy },
                { provide: RenderingService, useValue: renderingSpy },
                { provide: RenderingStateService, useValue: renderingStateSpy },
            ],
        }).compileComponents();

        service = TestBed.inject(MapManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call fetchMap when mapId exists', () => {
        service.fetchMap(testConsts.MOCK_NEW_MAP._id);

        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(testConsts.MOCK_NEW_MAP._id);
    });

    it('should initialize the map', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        expect(service.currentMap.mapArray).toEqual(testConsts.MOCK_NEW_MAP.mapArray);
        expect(service['originalMap']).toEqual(service.currentMap);
    });

    it('should add items', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        expect(service.getItemType(testConsts.ADDED_ITEM_POSITION_1)).toEqual(testConsts.MOCK_ADDED_BOOST_1);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });

    it('should correctly return if the limit of an item type was reached on small maps', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_BOOST_1)).toEqual(true);
        service.addItem(
            { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + testConsts.COL_INCREMENT_LIMIT_1 },
            testConsts.MOCK_ADDED_RANDOM_ITEM,
        );
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(false);
        service.addItem(
            { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + testConsts.COL_INCREMENT_LIMIT_2 },
            testConsts.MOCK_ADDED_RANDOM_ITEM,
        );
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(true);
    });

    it('should correctly return if the limit of an item type was reached on medium maps', () => {
        service.currentMap.size = MapSize.Medium;
        service.initializeMap(service.currentMap.size, testConsts.MOCK_NEW_MAP.mode);
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_BOOST_1)).toEqual(true);
        for (let i = 0; i < testConsts.COL_INCREMENT_LIMIT_2; i++) {
            service.addItem(
                { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + i + 1 },
                testConsts.MOCK_ADDED_RANDOM_ITEM,
            );
        }
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(false);
        service.addItem(
            { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + testConsts.COL_INCREMENT_LIMIT_2 + 1 },
            testConsts.MOCK_ADDED_RANDOM_ITEM,
        );

        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(true);
    });

    it('should correctly return if the limit of an item type was reached on large maps', () => {
        service.currentMap.size = MapSize.Large;
        service.initializeMap(service.currentMap.size, testConsts.MOCK_NEW_MAP.mode);
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_BOOST_1)).toEqual(true);
        for (let i = 0; i < testConsts.COL_INCREMENT_LIMIT_3; i++)
            service.addItem(
                { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + i + 1 },
                testConsts.MOCK_ADDED_RANDOM_ITEM,
            );
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(false);
        service.addItem(
            { ...testConsts.ADDED_ITEM_POSITION_1, x: testConsts.ADDED_ITEM_POSITION_1.x + testConsts.COL_INCREMENT_LIMIT_3 + 1 },
            testConsts.MOCK_ADDED_RANDOM_ITEM,
        );
        expect(service.isItemLimitReached(testConsts.MOCK_ADDED_RANDOM_ITEM)).toEqual(true);
    });

    it('should remove items', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        service.removeItem(testConsts.ADDED_ITEM_POSITION_1);
        expect(service.getItemType(testConsts.ADDED_ITEM_POSITION_1)).toEqual(null);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    it('should change tiles', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const changedTile: TileTerrain = TileTerrain.Ice;
        service.selectedTileType = changedTile;
        service.changeTile(testConsts.ADDED_ITEM_POSITION_1, changedTile);
        expect(service.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_1.y][testConsts.ADDED_ITEM_POSITION_1.x]).toEqual(TileTerrain.Ice);
    });

    it('should reset the map', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        let wasProperlyReset = true;
        const changedTile: TileTerrain = TileTerrain.Ice;
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        service.selectedTileType = changedTile;
        service.changeTile({ ...testConsts.ADDED_ITEM_POSITION_1, y: testConsts.ADDED_ITEM_POSITION_1.y + 1 }, changedTile);
        service.resetMap();

        for (let row = 0; row < service.currentMap.size; row++) {
            for (let col = 0; col < service.currentMap.size; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile !== TileTerrain.Grass) {
                    wasProperlyReset = false;
                }
            }
        }
        expect(wasProperlyReset).toEqual(true);
    });

    it('should reset the map to its original state if the id is valid', () => {
        service['mapId'] = '%Mig29Fulcrum';
        service['originalMap'] = JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP));
        service.currentMap = JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP));
        const wasProperlyReset = true;
        const changedTile: TileTerrain = TileTerrain.Ice;
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        service.selectedTileType = changedTile;
        service.changeTile({ ...testConsts.ADDED_ITEM_POSITION_1, y: testConsts.ADDED_ITEM_POSITION_1.y + 1 }, changedTile);
        service.resetMap();
        expect(service.currentMap.mapArray).toEqual(service['originalMap'].mapArray);
        expect(service.currentMap.description).toEqual(service['originalMap'].description);
        expect(service.currentMap.placedItems).toEqual(service['originalMap'].placedItems);
        expect(service.currentMap.mode).toEqual(service['originalMap'].mode);
        expect(service.currentMap.name).toEqual(service['originalMap'].name);
        expect(service.currentMap.size).toEqual(service['originalMap'].size);
        expect(service.currentMap.imageData).toEqual(service['originalMap'].imageData);
        expect(wasProperlyReset).toEqual(true);
    });

    it('should toggle doors', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const openDoor: TileTerrain = TileTerrain.OpenDoor;
        const closedDoor: TileTerrain = TileTerrain.ClosedDoor;
        service.selectedTileType = closedDoor;
        service.changeTile(testConsts.ADDED_ITEM_POSITION_1, closedDoor);
        service.toggleDoor(testConsts.ADDED_ITEM_POSITION_1);
        expect(service.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_1.y][testConsts.ADDED_ITEM_POSITION_1.x]).toEqual(openDoor);
        service.toggleDoor(testConsts.ADDED_ITEM_POSITION_1);
        expect(service.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_1.y][testConsts.ADDED_ITEM_POSITION_1.x]).toEqual(closedDoor);
    });

    it('should correctly return the map size', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        expect(service.getMapSize()).toEqual(testConsts.MOCK_NEW_MAP.size);
    });

    it('should correctly return the selected tile Type', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        service.selectTileType(TileTerrain.Ice);
        expect(service.selectedTileType).toEqual(TileTerrain.Ice);
    });

    it('should correctly return the max number of remaining starts and random items if nothing was placed', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const result = service.getRemainingStart(ItemType.Flag);
        spyOn(service, 'getMaxItems').and.returnValue(SMALL_MAP_ITEM_LIMIT);
        expect(result).toBe(SMALL_MAP_ITEM_LIMIT);
    });

    it('should return the correct number of remaining starts and random items if no items were placed', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        service.currentMap.placedItems.push({ position: testConsts.ADDED_ITEM_POSITION_1, type: ItemType.Random });
        const result = service.getRemainingStart(ItemType.Random);
        spyOn(service, 'getMaxItems').and.returnValue(SMALL_MAP_ITEM_LIMIT);
        expect(result).toBe(SMALL_MAP_ITEM_LIMIT - 1);
    });

    it('should saveMap if map is valid and image capture works on handleSave', (done) => {
        const validationResults: ValidationResult = testConsts.MOCK_SUCCESS_VALIDATION_RESULT;
        const screenshotElement = document.createElement('canvas');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saveMapSpy = spyOn<any>(service, 'saveMap').and.returnValue(of(true));

        service.handleSave(validationResults, screenshotElement.getContext('2d') as CanvasRenderingContext2D).subscribe((success) => {
            expect(saveMapSpy).toHaveBeenCalled();
            expect(success).toBeTrue();
            done();
        });
    });

    it('should return false when map is invalid on handleSave', (done) => {
        const validationResults: ValidationResult = testConsts.MOCK_FAIL_VALIDATION_RESULT;
        const screenshotElement = document.createElement('canvas');

        service.handleSave(validationResults, screenshotElement.getContext('2d') as CanvasRenderingContext2D).subscribe((success) => {
            expect(success).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalled();
            done();
        });
    });

    it('should updateMap if map exists on saveMap', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateSpy = spyOn<any>(service, 'updateMap').and.returnValue(of(true));
        service['mapId'] = testConsts.MOCK_MAPS[0]._id;
        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.MOCK_MAPS[0]));
        service['saveMap']().subscribe((success) => {
            expect(updateSpy).toHaveBeenCalled();
            expect(success).toEqual(true);
        });
    });

    it("should createMap if map doesn't exist on saveMap", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createSpy = spyOn<any>(service, 'createMap').and.returnValue(of(true));
        service['mapId'] = testConsts.MOCK_MAPS[0]._id;
        mapAPIServiceSpy.getMapById.and.returnValue(throwError(() => new Error('error')));
        service['saveMap']().subscribe((success) => {
            expect(createSpy).toHaveBeenCalled();
            expect(success).toBeTrue();
        });
    });

    it("should createMap if mapId doesn't exist on saveMap", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createSpy = spyOn<any>(service, 'createMap').and.returnValue(of(true));
        service['saveMap']().subscribe((success) => {
            expect(createSpy).toHaveBeenCalled();
            expect(success).toBeTrue();
        });
    });

    it('should return a true on updateMap', (done) => {
        service['originalMap'] = testConsts.MOCK_NEW_MAP;
        service['currentMap'] = testConsts.MOCK_NEW_MAP;
        mapAPIServiceSpy.updateMap.and.returnValue(of(testConsts.MOCK_MAPS[0]));
        service['updateMap']().subscribe((success) => {
            expect(modalMessageSpy.showMessage).toHaveBeenCalledWith({
                title: editPageConsts.CREATION_EDITION_ERROR_TITLES.edition,
                content: jasmine.anything(),
            });
            expect(success).toBeTrue();
            done();
        });
    });

    it('should return no message on failed updateMap', (done) => {
        service['originalMap'] = testConsts.MOCK_NEW_MAP;
        service['currentMap'] = testConsts.MOCK_NEW_MAP;
        mapAPIServiceSpy.updateMap.and.returnValue(throwError(() => new Error('error')));
        service['updateMap']().subscribe((success) => {
            expect(success).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalled();
            done();
        });
    });

    it('should return true on createMap', (done) => {
        mapAPIServiceSpy.createMap.and.returnValue(of({ id: '0' }));
        service['createMap']().subscribe((success) => {
            expect(success).toBeTrue();
            expect(modalMessageSpy.showMessage).toHaveBeenCalledWith({
                title: editPageConsts.CREATION_EDITION_ERROR_TITLES.creation,
                content: jasmine.anything(),
            });
            done();
        });
    });

    it('should return no message on failed createMap', (done) => {
        mapAPIServiceSpy.createMap.and.returnValue(throwError(() => new Error('error')));
        service['createMap']().subscribe((success) => {
            expect(success).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalled();
            done();
        });
    });

    it('should update the image data when takeScreenShot is called', () => {
        const imageData = 'image-data';
        renderingSpy.renderScreenshot.and.returnValue(imageData);
        const screenshotElement = document.createElement('canvas');
        service['takeScreenShot'](screenshotElement.getContext('2d') as CanvasRenderingContext2D);
        expect(renderingSpy.renderScreenshot).toHaveBeenCalled();
        expect(service.currentMap.imageData).toEqual(imageData);
    });

    it('should return the correct remaining number of random items', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);

        spyOn(service, 'getMaxItems').and.returnValue(LARGE_MAP_ITEM_LIMIT);

        service.currentMap.placedItems.push({ position: testConsts.ADDED_ITEM_POSITION_1, type: ItemType.Random });

        const remainingRandom = service.getRemainingRandom();
        expect(remainingRandom).toBe(LARGE_MAP_ITEM_LIMIT - 1);
    });

    it('should return the correct tile at a valid position', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const position: Vec2 = { x: 2, y: 3 };
        const expectedTile = service.currentMap.mapArray[position.y][position.x];
        const result = service.getTileAtPosition(position);
        expect(result).toEqual(expectedTile);
    });

    it('should return 0 for a position if map is not initialized', () => {
        const position: Vec2 = { x: 2, y: 3 };
        const result = service.getTileAtPosition(position);
        expect(result).toBe(0);
    });

    it('should return the correct tile after map reset', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const position: Vec2 = { x: 2, y: 3 };
        const initialTile = service.getTileAtPosition(position);
        service.resetMap();
        const resetTile = service.getTileAtPosition(position);
        expect(resetTile).toEqual(initialTile);
    });

    it('should handle invalid positions with undefined map', () => {
        const position: Vec2 = { x: 2, y: 3 };
        const result = service.getTileAtPosition(position);
        expect(result).toBe(0);
    });

    it('should return undefined if map is not initialized', () => {
        Object.defineProperty(service, 'currentMap', {
            value: undefined,
        });
        const position: Vec2 = { x: 2, y: 3 };
        const result = service.getItemAtPosition(position);
        expect(result).toBeUndefined();
    });

    it('should return the item at the given position if placed', () => {
        const item = { position: { x: 2, y: 3 }, type: ItemType.BismuthShield };
        service.currentMap = {
            placedItems: [item],
        } as Map;
        const position: Vec2 = { x: 2, y: 3 };
        const result = service.getItemAtPosition(position);
        expect(result).toEqual(item);
    });

    it('should return undefined if no item is placed at the given position', () => {
        const item = { position: { x: 2, y: 3 }, type: ItemType.BismuthShield };
        service.currentMap = {
            placedItems: [item],
        } as Map;
        const position: Vec2 = { x: 4, y: 5 };
        const result = service.getItemAtPosition(position);
        expect(result).toBeUndefined();
    });

    it('should return undefined if the placedItems array is empty', () => {
        service.currentMap = {
            placedItems: [],
        } as unknown as Map;
        const position: Vec2 = { x: 2, y: 3 };
        const result = service.getItemAtPosition(position);
        expect(result).toBeUndefined();
    });
});
