import { TestBed } from '@angular/core/testing';
import * as testConsts from '@app/constants/tests.constants';
import { Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/map-api.service';
import { of } from 'rxjs';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;

// import SpyObj = jasmine.SpyObj;

import SpyObj = jasmine.SpyObj;

describe('EditPageService', () => {
    let service: MapManagerService;

    let mapAPIServiceSpy: SpyObj<MapAPIService>;
    let mockHTML2Canvas: SpyObj<typeof html2canvas>;

    const addedItem: Item = Item.BOOST1;
    const addedRandomItem: Item = Item.RANDOM;
    const addedStartPoint: Item = Item.START;

    const iceTile: TileTerrain = TileTerrain.ICE;
    const openDoor: TileTerrain = TileTerrain.OPENDOOR;
    const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;

    const rowIndex = 5;
    const colIndex = 5;

    const colIncrementLimit1 = 1;
    const colIncrementLimit2 = 3;
    const colIncrementLimit3 = 5;

    const mockMapGrassOnly: Map = {
        _id: 'grassOnly',
        name: 'Mock Map 1',
        description: '',
        size: 10,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
        imageData: '',
    };

    const mockMapWithItems: Map = {
        _id: 'addedItem',
        name: 'Mock Map 1',
        description: '',
        size: 10,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [addedItem],
        isVisible: true,
        dateOfLastModification: new Date(),
        imageData: '',
    };

    mockMapWithItems.mapArray[0][0] = { terrain: TileTerrain.GRASS, item: addedItem };
    mockMapWithItems.placedItems[0] = addedItem;

    beforeEach(() => {
        mapAPIServiceSpy = jasmine.createSpyObj('ServerManagerService', ['getMapById']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(mockMapGrassOnly));
        mockHTML2Canvas = jasmine.createSpyObj('html2canvas', ['then']);
        TestBed.overrideProvider(MapAPIService, { useValue: mapAPIServiceSpy });
        TestBed.overrideProvider(html2canvas, { useValue: mockHTML2Canvas });
        TestBed.configureTestingModule({
            providers: [MapManagerService, html2canvas],
        });
        service = TestBed.inject(MapManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // onInit()
    it('should call fetchMap when mapId exists', () => {
        service.fetchMap(testConsts.mockNewMap._id);

        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(testConsts.mockNewMap._id);
    });

    // it('should initialize an empty map', () => {
    //     service.onInit(null);
    // });

    // it('should account for placed items', () => {
    //     service.onInit(mockMapWithItems._id);
    // });

    // TODO
    // captureMapAsImage()
    it('should convert the html to Canvas', () => {});

    // getMapSize()
    it('should return proper map size', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        expect(service.getMapSize()).toEqual(MapSize.SMALL);
    });

    // initializeMap()
    it('should initialize the map', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        expect(service.currentMap.mapArray).toEqual(testConsts.mockNewMap.mapArray);
        expect(service.originalMap).toEqual(service.currentMap);
        expect(service.originalMap.placedItems.length).toEqual(0);
    });

    it('should add items', () => {
        service.initializeMap(testConsts.mockNewMap.size, testConsts.mockNewMap.mode);
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(testConsts.addedItemRowIndex, testConsts.addedItemColIndex, testConsts.mockAddedBoost1);
        expect(service.currentMap.mapArray[testConsts.addedItemRowIndex][testConsts.addedItemColIndex].item).toEqual(testConsts.mockAddedBoost1);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });

    // it('should return proper tile type on null', () => {
    //     service.onInit(null);
    //     service.selectTileType(null);
    //     expect(service.selectedTileType).toEqual(null);
    // });

    // getMaxItems()
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

    it('should reset map to not modified map', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        service.addItem(rowIndex + 1, colIndex, addedStartPoint);
        service.resetMap();
        let wasReset = true;
        for (let row = 0; row < service.currentMap.size; row++) {
            for (let col = 0; col < service.currentMap.size; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile.terrain !== mockMapWithItems.mapArray[row][col].terrain) {
                    wasReset = false;
                }
            }
        }
        expect(wasReset).toEqual(true);
        service.removeItem(rowIndex + 1, colIndex);
    });

    // isItemLimitReached()
    it('should verify item limit for random items', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        service.addItem(rowIndex, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex + 1, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should verify item limit for start positions', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        service.addItem(rowIndex, colIndex, addedStartPoint);
        expect(service.isItemLimitReached(addedStartPoint)).toEqual(false);
        service.addItem(rowIndex + 1, colIndex, addedStartPoint);
        expect(service.isItemLimitReached(addedStartPoint)).toEqual(true);
    });

    it('should verify item limit for other items', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
    });

    // changeTile()
    it('should change tiles', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        service.selectedTileType = iceTile;
        service.changeTile(rowIndex, colIndex, iceTile);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(TileTerrain.ICE);
    });

    // toggleDoor()
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

    // removeItem()
    it('should remove items', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        service.removeItem(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    // addItem()
    it('should add items', () => {
        service.initializeMap(mockMapGrassOnly.size, mockMapGrassOnly.mode);
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(addedItem);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });
});
