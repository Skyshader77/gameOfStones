import { TestBed } from '@angular/core/testing';

import { GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import SpyObj = jasmine.SpyObj;

import { of } from 'rxjs';
import { MapAPIService } from '../map-api.service';

describe('EditPageService', () => {
    let service: MapManagerService;

    let mapAPIServiceSpy: SpyObj<MapAPIService>;

    const addedItem: Item = Item.BOOST1;
    const addedRandomItem: Item = Item.RANDOM;
    const addedStartPoint: Item = Item.START;
    //    const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
    const iceTile: TileTerrain = TileTerrain.ICE;
    //    const grassTile: TileTerrain = TileTerrain.GRASS;
    const rowIndex = 5;
    const colIndex = 5;
    //    const firstRow = 0;
    const colIncrementLimit1 = 1;
    const colIncrementLimit2 = 3;
    const colIncrementLimit3 = 5;
    //    const rowIncrementLimit1 = 3;
    //    const rowIncrementLimit2 = 5;

    const mockMapGrassOnly: Map = {
        _id: 'ABCDEF',
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
    };

    const mockMapWithItems: Map = {
        _id: 'FEDCBA',
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
    };

    mockMapWithItems.mapArray[0][0] = { terrain: TileTerrain.GRASS, item: addedItem };
    mockMapWithItems.placedItems[0] = addedItem;

    beforeEach(() => {
        mapAPIServiceSpy = jasmine.createSpyObj('ServerManagerService', ['getMapById']);
        mapAPIServiceSpy.getMapById.and.returnValue(of(mockMapGrassOnly));
        TestBed.overrideProvider(MapAPIService, { useValue: mapAPIServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapManagerService],
        });
        service = TestBed.inject(MapManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // onInit()
    it('should call fetchMap when mapId exists', () => {
        service.onInit(mockMapGrassOnly._id);

        expect(mapAPIServiceSpy.getMapById).toHaveBeenCalledWith(mockMapGrassOnly._id);
    });

    it('should initialize an empty map', () => {
        service.onInit(null);
    });

    it('should account for placed items', () => {
        service.onInit(mockMapWithItems._id);
    });

    // getMapSize()
    it('should return proper map size', () => {
        service.onInit(mockMapGrassOnly._id);
        expect(service.getMapSize()).toEqual(MapSize.SMALL);
    });

    // initializeMap()
    it('should initialize the map', () => {
        service.initializeMap();
        expect(service.currentMap.mapArray).toEqual(mockMapGrassOnly.mapArray);
        expect(service.originalMap).toEqual(service.currentMap);
        expect(service.originalMap.placedItems.length).toEqual(0);
    });

    // selectTileType()
    it('should properly select tile types', () => {
        service.onInit(null);
        service.selectTileType(iceTile);
        expect(service.selectedTileType).toEqual(iceTile);
    });

    it('should return proper tile type on null', () => {
        service.onInit(null);
        service.selectTileType(null);
        expect(service.selectedTileType).toEqual(null);
    });

    // getMaxItems()
    it('should check for reached limit of items on small maps', () => {
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        service.addItem(rowIndex, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + colIncrementLimit1, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should check for reached limit of items on medium maps', () => {
        service.currentMap.size = MapSize.MEDIUM;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < colIncrementLimit2; i++) service.addItem(rowIndex, colIndex + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + colIncrementLimit2, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should check for reached limit of items on large maps', () => {
        service.currentMap.size = MapSize.LARGE;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < colIncrementLimit3; i++) service.addItem(rowIndex, colIndex + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + colIncrementLimit3, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    // resetMap()
    it('should reset the map', () => {
        service.initializeMap();
        let wasReset = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(rowIndex, colIndex, addedItem);
        service.selectedTileType = changedTile;
        service.changeTile(rowIndex + 1, colIndex, changedTile);
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
        service.onInit(mockMapWithItems._id);
        service.addItem(rowIndex + 1, colIndex, addedStartPoint);
        // expect(service.currentMap.mapArray[rowIndex + 1][0].item).toEqual(addedStartPoint);
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
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex + 1, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should verify item limit for start positions', () => {
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedStartPoint);
        expect(service.isItemLimitReached(addedStartPoint)).toEqual(false);
        service.addItem(rowIndex + 1, colIndex, addedStartPoint);
        expect(service.isItemLimitReached(addedStartPoint)).toEqual(true);
    });

    it('should verify item limit for other items', () => {
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
    });

    // changeTile()
    it('should change tiles', () => {
        service.initializeMap();
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(rowIndex, colIndex, changedTile);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(TileTerrain.ICE);
    });

    // toggleDoor()
    it('should toggle doors', () => {
        service.initializeMap();
        const openDoor: TileTerrain = TileTerrain.OPENDOOR;
        const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
        service.selectedTileType = closedDoor;
        service.changeTile(rowIndex, colIndex, closedDoor);
        service.toggleDoor(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(openDoor);
        service.toggleDoor(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(closedDoor);
    });

    // removeItem()
    it('should remove items', () => {
        service.initializeMap();
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        service.removeItem(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    // addItem()
    it('should add items', () => {
        service.initializeMap();
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(addedItem);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });
});
