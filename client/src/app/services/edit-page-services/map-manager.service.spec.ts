import { TestBed } from '@angular/core/testing';
import * as editPageConsts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';
import { ItemType, MapSize, TileTerrain } from '@app/interfaces/map';
import { Observable, of, Subscriber, throwError } from 'rxjs';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;
import { ValidationResult } from '@app/interfaces/validation';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';

describe('MapManagerService', () => {
    let service: MapManagerService;
    let mapAPIServiceSpy: SpyObj<MapAPIService>;
    let modalMessageSpy: SpyObj<ModalMessageService>;

    beforeEach(async () => {
        mapAPIServiceSpy = jasmine.createSpyObj('MapAPIService', ['getMapById', 'updateMap', 'createMap']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.MOCK_NEW_MAP));
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showMessage']);

        await TestBed.configureTestingModule({
            providers: [
                { provide: MapAPIService, useValue: mapAPIServiceSpy },
                { provide: ModalMessageService, useValue: modalMessageSpy },
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
        service.currentMap.size = MapSize.MEDIUM;
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
        service.currentMap.size = MapSize.LARGE;
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
        expect(service.getItemType(testConsts.ADDED_ITEM_POSITION_1)).toEqual(ItemType.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    it('should change tiles', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(testConsts.ADDED_ITEM_POSITION_1, changedTile);
        expect(service.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_1.y][testConsts.ADDED_ITEM_POSITION_1.x]).toEqual(TileTerrain.ICE);
    });

    it('should reset the map', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        let wasProperlyReset = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(testConsts.ADDED_ITEM_POSITION_1, testConsts.MOCK_ADDED_BOOST_1);
        service.selectedTileType = changedTile;
        service.changeTile({ ...testConsts.ADDED_ITEM_POSITION_1, y: testConsts.ADDED_ITEM_POSITION_1.y + 1 }, changedTile);
        service.resetMap();

        for (let row = 0; row < service.currentMap.size; row++) {
            for (let col = 0; col < service.currentMap.size; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile !== TileTerrain.GRASS) {
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
        const changedTile: TileTerrain = TileTerrain.ICE;
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
        const openDoor: TileTerrain = TileTerrain.OPENDOOR;
        const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
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
        service.selectTileType(TileTerrain.ICE);
        expect(service.selectedTileType).toEqual(TileTerrain.ICE);
    });

    it('should correctly return the max number of remaining starts and random items if nothing was placed', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        const result = service.getRemainingRandomAndStart(ItemType.FLAG);
        spyOn(service, 'getMaxItems').and.returnValue(editPageConsts.SMALL_MAP_ITEM_LIMIT);
        expect(result).toBe(editPageConsts.SMALL_MAP_ITEM_LIMIT);
    });

    it('should return the correct number of remaining starts and random items if no items were placed', () => {
        service.initializeMap(testConsts.MOCK_NEW_MAP.size, testConsts.MOCK_NEW_MAP.mode);
        service.currentMap.placedItems.push({ position: testConsts.ADDED_ITEM_POSITION_1, type: ItemType.RANDOM });
        const result = service.getRemainingRandomAndStart(ItemType.RANDOM);
        spyOn(service, 'getMaxItems').and.returnValue(editPageConsts.SMALL_MAP_ITEM_LIMIT);
        expect(result).toBe(editPageConsts.SMALL_MAP_ITEM_LIMIT - 1);
    });

    it('should saveMap if map is valid and image capture works on handleSave', (done) => {
        const validationResults: ValidationResult = testConsts.MOCK_SUCCESS_VALIDATION_RESULT;
        const mapElement = document.createElement('div');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const captureImageSpy = spyOn<any>(service, 'captureMapAsImage').and.returnValue(of(undefined));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saveMapSpy = spyOn<any>(service, 'saveMap').and.returnValue(of(true));

        service.handleSave(validationResults, mapElement).subscribe((success) => {
            expect(captureImageSpy).toHaveBeenCalled();
            expect(saveMapSpy).toHaveBeenCalled();
            expect(success).toBeTrue();
            done();
        });
    });

    it('should return false when map is invalid on handleSave', (done) => {
        const validationResults: ValidationResult = testConsts.MOCK_FAIL_VALIDATION_RESULT;
        const mapElement = document.createElement('div');

        service.handleSave(validationResults, mapElement).subscribe((success) => {
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

    it('should update the image data when updateImageData is called', (done) => {
        const mockCanvas: HTMLCanvasElement = document.createElement('canvas');
        spyOn(mockCanvas, 'toDataURL').and.returnValue('data:image/jpeg;base64,testImageData');
        const observer = new Observable<void>((subscriber) => {
            service['updateImageData'](mockCanvas, subscriber);
        });

        observer.subscribe(() => {
            expect(service.currentMap.imageData).toBe('data:image/jpeg;base64,testImageData');
            done();
        });
    });

    it('should call html2canvas on captureMapAsImage', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
        const screenShotSpy = spyOn<any>(service, 'takeScreenShot').and.callFake((mapElement: HTMLElement, subscriber: Subscriber<void>) => {
            subscriber.next();
            subscriber.complete();
        });
        const mapElement = document.createElement('div');
        service['captureMapAsImage'](mapElement).subscribe(() => {
            expect(screenShotSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should update the image data when takeScreenShot is called', (done) => {
        const mockCanvas: HTMLCanvasElement = document.createElement('canvas');
        mockCanvas.width = 1;
        mockCanvas.height = 1;
        document.body.appendChild(mockCanvas);
        spyOn(mockCanvas, 'toDataURL').and.returnValue('data:image/jpeg;base64,testImageData');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateImageSpy = spyOn<any>(service, 'updateImageData').and.callFake((canvas: HTMLCanvasElement, subscriber: Subscriber<void>) => {
            subscriber.next();
            subscriber.complete();
        });
        const observer = new Observable<void>((subscriber) => {
            service['takeScreenShot'](mockCanvas, subscriber);
        });

        observer.subscribe(() => {
            expect(updateImageSpy).toHaveBeenCalled();
            done();
        });
        document.body.removeChild(mockCanvas);
    });
});
