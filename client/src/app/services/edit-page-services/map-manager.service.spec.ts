import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as editPageConsts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';
import { Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { ValidationStatus } from '@app/interfaces/validation';
import { MapAPIService } from '@app/services/map-api.service';
import { of, throwError } from 'rxjs';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;

describe('MapManagerService', () => {
    let service: MapManagerService;
    let routerSpy: jasmine.SpyObj<Router>;
    let mapAPIServiceSpy: SpyObj<MapAPIService>;

    beforeEach(() => {
        mapAPIServiceSpy = jasmine.createSpyObj('ServerManagerService', ['getMapById', 'updateMap', 'createMap']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.mockNewMap));
        TestBed.overrideProvider(MapAPIService, { useValue: mapAPIServiceSpy });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            providers: [MapManagerService, { provide: Router, useValue: routerSpy }],
        });
        service = TestBed.inject(MapManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call fetchMap when mapId exists', () => {
        service.fetchMap(testConsts.mockNewMap._id);

        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(testConsts.mockNewMap._id);
    });

    it('should initialize the map', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        expect(service.currentMap.mapArray).toEqual(testConsts.mockNewMap.mapArray);
        expect(service['originalMap']).toEqual(service.currentMap);
    });

    it('should add items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        expect(service.currentMap.mapArray[testConsts.addedItemPosition1.y][testConsts.addedItemPosition1.x].item).toEqual(
            testConsts.mockAddedBoost1,
        );
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });

    it('should correctly return if the limit of an item type was reached on small maps', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        service.addItem(
            { ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + testConsts.colIncrementLimit1 },
            testConsts.mockAddedRandomItem,
        );
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(
            { ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + testConsts.colIncrementLimit2 },
            testConsts.mockAddedRandomItem,
        );
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should correctly return if the limit of an item type was reached on medium maps', () => {
        service.currentMap.size = MapSize.MEDIUM;
        service.initializeMap(service.currentMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        for (let i = 0; i < testConsts.colIncrementLimit2; i++)
            service.addItem({ ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + i }, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(
            { ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + testConsts.colIncrementLimit2 },
            testConsts.mockAddedRandomItem,
        );
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should correctly return if the limit of an item type was reached on large maps', () => {
        service.currentMap.size = MapSize.LARGE;
        service.initializeMap(service.currentMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        for (let i = 0; i < testConsts.colIncrementLimit3; i++)
            service.addItem({ ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + i }, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(
            { ...testConsts.addedItemPosition1, x: testConsts.addedItemPosition1.x + testConsts.colIncrementLimit3 },
            testConsts.mockAddedRandomItem,
        );
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should remove items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        service.removeItem(testConsts.addedItemPosition1);
        expect(service.currentMap.mapArray[testConsts.addedItemPosition1.y][testConsts.addedItemPosition1.x].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    it('should change tiles', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(testConsts.addedItemPosition1, changedTile);
        expect(service.currentMap.mapArray[testConsts.addedItemPosition1.y][testConsts.addedItemPosition1.x].terrain).toEqual(TileTerrain.ICE);
    });

    it('should reset the map', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        let wasProperlyReset = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        service.selectedTileType = changedTile;
        service.changeTile({ ...testConsts.addedItemPosition1, y: testConsts.addedItemPosition1.y + 1 }, changedTile);
        service.resetMap();

        for (let row = 0; row < service.currentMap.size; row++) {
            for (let col = 0; col < service.currentMap.size; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile.terrain !== TileTerrain.GRASS) {
                    wasProperlyReset = false;
                }
            }
        }
        expect(wasProperlyReset).toEqual(true);
    });

    it('should reset the map to its original state if the id is valid', () => {
        service['mapId'] = '%Mig29Fulcrum';
        service['originalMap'] = JSON.parse(JSON.stringify(testConsts.mockNewMap));
        service.currentMap = JSON.parse(JSON.stringify(testConsts.mockNewMap));
        const wasProperlyReset = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(testConsts.addedItemPosition1, testConsts.mockAddedBoost1);
        service.selectedTileType = changedTile;
        service.changeTile({ ...testConsts.addedItemPosition1, y: testConsts.addedItemPosition1.y + 1 }, changedTile);
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
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const openDoor: TileTerrain = TileTerrain.OPENDOOR;
        const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
        service.selectedTileType = closedDoor;
        service.changeTile(testConsts.addedItemPosition1, closedDoor);
        service.toggleDoor(testConsts.addedItemPosition1);
        expect(service.currentMap.mapArray[testConsts.addedItemPosition1.y][testConsts.addedItemPosition1.x].terrain).toEqual(openDoor);
        service.toggleDoor(testConsts.addedItemPosition1);
        expect(service.currentMap.mapArray[testConsts.addedItemPosition1.y][testConsts.addedItemPosition1.x].terrain).toEqual(closedDoor);
    });

    it('should correctly return the map size', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        expect(service.getMapSize()).toEqual(testConsts.mockNewMap.size);
    });

    it('should correctly return the selected tile Type', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        service.selectTileType(TileTerrain.ICE);
        expect(service.selectedTileType).toEqual(TileTerrain.ICE);
    });

    it('should correctly return the number of remaning starts and random items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const result = service.getRemainingRandomAndStart(Item.FLAG);
        spyOn(service, 'getMaxItems').and.returnValue(editPageConsts.SMALL_MAP_ITEM_LIMIT);
        expect(result).toBe(editPageConsts.SMALL_MAP_ITEM_LIMIT);
    });

    it('should call captureMapAsImage, then updateMap if map is valid and mapId exists', async () => {
        const validationResults: ValidationStatus = testConsts.mockSuccessValidationStatus.validationStatus;
        service['mapId'] = 'someMapId';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'captureMapAsImage').and.returnValue(Promise.resolve());

        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.mockNewMap));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'updateMap');

        const mapElement = document.createElement('div');
        await service.handleSave(validationResults, mapElement);

        expect(service['captureMapAsImage']).toHaveBeenCalled();
        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(service['mapId']);
        expect(service['updateMap']).toHaveBeenCalledWith(validationResults);
    });

    it('should call captureMapAsImage, then createMap if map is valid and mapId does not exist', async () => {
        const validationResults: ValidationStatus = testConsts.mockSuccessValidationStatus.validationStatus;
        service['mapId'] = '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'captureMapAsImage').and.returnValue(Promise.resolve());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'createMap');

        const mapElement = document.createElement('div');
        await service.handleSave(validationResults, mapElement);

        expect(service['captureMapAsImage']).toHaveBeenCalled();
        expect(mapAPIServiceSpy.getMapById).not.toHaveBeenCalled();
        expect(service['createMap']).toHaveBeenCalledWith(validationResults);
    });

    it('should call createMap when getMapById fails', async () => {
        const validationResults: ValidationStatus = testConsts.mockSuccessValidationStatus.validationStatus;
        service['mapId'] = 'someMapId';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'captureMapAsImage').and.returnValue(Promise.resolve());

        mapAPIServiceSpy.getMapById.and.returnValue(throwError(new Error('error')));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'createMap');

        const mapElement = document.createElement('div');
        await service.handleSave(validationResults, mapElement);

        expect(service['captureMapAsImage']).toHaveBeenCalled();
        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(service['mapId']);
        expect(service['createMap']).toHaveBeenCalledWith(validationResults);
    });

    it('should call updateMap and emit success message', () => {
        const validationResults: ValidationStatus = testConsts.mockSuccessValidationStatus.validationStatus;
        JSON.parse(JSON.stringify(testConsts.mockNewMap));
        const updatedMap: Map = {
            ...service.currentMap,
            _id: service['mapId'],
            isVisible: false,
            dateOfLastModification: new Date('2024-10-01T12:00:00Z'),
        };
        mapAPIServiceSpy.updateMap.and.returnValue(of(updatedMap));
        service['updateMap'](validationResults);
        service.mapValidationStatus.subscribe((result) => {
            expect(result.message).toBe('La carte a été mise à jour!');
            expect(result.validationStatus).toEqual(validationResults);
        });

        const mapElement = document.createElement('div');
        service.handleSave(validationResults, mapElement);

        expect(mapAPIServiceSpy.updateMap).toHaveBeenCalledWith(
            jasmine.objectContaining({
                _id: service['mapId'],
                mode: service.currentMap.mode,
                mapArray: service.currentMap.mapArray,
                placedItems: service.currentMap.placedItems,
                imageData: service.currentMap.imageData,
                size: service.currentMap.size,
                isVisible: false,
            }),
        );
    });

    it('should emit error message when updateMap fails', () => {
        const validationResults: ValidationStatus = testConsts.mockFailValidationStatus.validationStatus;
        const errorMessage = 'La carte est invalide !';
        mapAPIServiceSpy.updateMap.and.returnValue(throwError(new Error(errorMessage)));
        service['updateMap'](validationResults);
        service.mapValidationStatus.subscribe((result) => {
            expect(result.message).toBe(errorMessage);
            expect(result.validationStatus).toEqual(validationResults);
        });

        const mapElement = document.createElement('div');
        service.handleSave(validationResults, mapElement);

        expect(mapAPIServiceSpy.updateMap).toHaveBeenCalled();
    });

    it('should call createMap and emit success message when creating a new map', () => {
        const validationResults: ValidationStatus = testConsts.mockSuccessValidationStatus.validationStatus;
        service.currentMap = JSON.parse(JSON.stringify(testConsts.mockNewMap));
        service['mapId'] = '';

        mapAPIServiceSpy.createMap.and.returnValue(of({ id: 'F16FightingFalcon' }));
        service['createMap'](validationResults);
        service.mapValidationStatus.subscribe((result) => {
            expect(result.message).toBe('La carte a été enregistrée!');
            expect(result.validationStatus).toEqual(validationResults);
        });

        const mapElement = document.createElement('div');
        service.handleSave(validationResults, mapElement);

        expect(mapAPIServiceSpy.createMap).toHaveBeenCalledWith(service.currentMap);
    });

    it('should emit error message when createMap fails', () => {
        const validationResults: ValidationStatus = testConsts.mockFailValidationStatus.validationStatus;
        const errorMessage = 'The map creation has failed';
        mapAPIServiceSpy.createMap.and.returnValue(throwError(new Error(errorMessage)));
        service['createMap'](validationResults);
        service.mapValidationStatus.subscribe((result) => {
            expect(result.message).toBe('La carte est invalide !');
            expect(result.validationStatus).toEqual(validationResults);
        });

        const mapElement = document.createElement('div');
        service.handleSave(validationResults, mapElement);

        expect(mapAPIServiceSpy.createMap).toHaveBeenCalled();
    });

    it('should set redirection to admin when dialog closes', () => {
        const dialogMock = document.createElement('dialog');
        dialogMock.id = 'editPageDialog';
        document.body.appendChild(dialogMock);

        service['setRedirectionToAdmin']();

        const closeEvent = new Event('close');
        dialogMock.dispatchEvent(closeEvent);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should update the image data when updateImageData is called', () => {
        const mockCanvas: HTMLCanvasElement = document.createElement('canvas');
        spyOn(mockCanvas, 'toDataURL').and.returnValue('data:image/jpeg;base64,testImageData');
        service['updateImageData'](mockCanvas);
        expect(service.currentMap.imageData).toBe('data:image/jpeg;base64,testImageData');
    });
});
