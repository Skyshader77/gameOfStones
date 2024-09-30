import { TestBed } from '@angular/core/testing';
import * as testConsts from '@app/constants/tests.constants';
import { Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/map-api.service';
import { of } from 'rxjs';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;

// import SpyObj = jasmine.SpyObj;

describe('MapManagerService', () => {
    let service: MapManagerService;

    let mapAPIServiceSpy: SpyObj<MapAPIService>;

    beforeEach(() => {
        mapAPIServiceSpy = jasmine.createSpyObj('ServerManagerService', ['getMapById']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(testConsts.mockNewMap));
        TestBed.overrideProvider(MapAPIService, { useValue: mapAPIServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapManagerService],
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
        expect(service.originalMap).toEqual(service.currentMap);
    });

    it('should add items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].item).toEqual(testConsts.mockAddedBoost1);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });

    it('should check for reached limit of items on small maps', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex + testConsts.colIncrementLimit1, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should check for reached limit of items on medium maps', () => {
        service.currentMap.size = MapSize.MEDIUM;
        service.initializeMap(service.currentMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        for (let i = 0; i < testConsts.colIncrementLimit2; i++)
            service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex + i, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex + testConsts.colIncrementLimit2, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should check for reached limit of items on large maps', () => {
        service.currentMap.size = MapSize.LARGE;
        service.initializeMap(service.currentMap.size, testConsts.mockNewMap.mode);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        expect(service.isItemLimitReached(testConsts.mockAddedBoost1)).toEqual(true);
        for (let i = 0; i < testConsts.colIncrementLimit3; i++)
            service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex + i, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(false);
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex + testConsts.colIncrementLimit3, testConsts.mockAddedRandomItem);
        expect(service.isItemLimitReached(testConsts.mockAddedRandomItem)).toEqual(true);
    });

    it('should remove items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        service.removeItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    it('should change tiles', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, changedTile);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].terrain).toEqual(TileTerrain.ICE);
    });

    it('should reset the map', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        let wasReset = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        service.selectedTileType = changedTile;
        service.changeTile(testConsts.addedItemRowIndex + 1, testConsts.addedItemColIndex, changedTile);
        service.resetMap();

        for (let row = 0; row < service.currentMap.size; row++) {
            for (let col = 0; col < service.currentMap.size; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile.terrain !== TileTerrain.GRASS) {
                    wasReset = false;
                }
            }
        }
        expect(wasReset).toEqual(true);
    });

    it('should toggle doors', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const openDoor: TileTerrain = TileTerrain.OPENDOOR;
        const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
        service.selectedTileType = closedDoor;
        service.changeTile(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, closedDoor);
        service.toggleDoor(testConsts.addedItemRowIndex, testConsts.addedItemColIndex);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].terrain).toEqual(openDoor);
        service.toggleDoor(testConsts.addedItemRowIndex, testConsts.addedItemColIndex);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].terrain).toEqual(closedDoor);
    });
});
