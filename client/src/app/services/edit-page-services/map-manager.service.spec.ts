import { TestBed } from '@angular/core/testing';

import { GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { ServerManagerService } from './server-manager.service';
import SpyObj = jasmine.SpyObj;

import * as consts from '@app/constants/edit-page-consts';
import { of } from 'rxjs';

// import SpyObj = jasmine.SpyObj;

describe('MapManagerService', () => {
    let service: MapManagerService;

    let serverManagerServiceSpy: SpyObj<ServerManagerService>;

    const mockMapGrassOnly: Map = {
        _id: 'ABCDEF',
        name: 'Mock Map 1',
        description: '',
        size: 0,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: consts.SMALL_MAP_SIZE }, () =>
            Array.from({ length: consts.SMALL_MAP_SIZE }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
    };

    const addedItem: Item = Item.BOOST1;
    const addedRandomItem: Item = Item.RANDOM;
    const rowIndex = 5;
    const colIndex = 5;
    const colIncrementLimit1 = 1;
    const colIncrementLimit2 = 3;
    const colIncrementLimit3 = 5;

    beforeEach(() => {
        serverManagerServiceSpy = jasmine.createSpyObj('ServerManagerService', ['fetchMap']);
        serverManagerServiceSpy.fetchMap.and.returnValue(of(mockMapGrassOnly));
        TestBed.overrideProvider(ServerManagerService, { useValue: serverManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapManagerService],
        });
        service = TestBed.inject(MapManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call fetchMap when mapId exists', () => {
        service.onInit(mockMapGrassOnly._id);

        expect(serverManagerServiceSpy.fetchMap).toHaveBeenCalledWith(mockMapGrassOnly._id);
    });

    it('should initialize the map', () => {
        service.initializeMap();
        expect(service.currentMap.mapArray).toEqual(mockMapGrassOnly.mapArray);
        expect(service.originalMap).toEqual(service.currentMap);
    });

    it('should add items', () => {
        service.initializeMap();
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(addedItem);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);
    });

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
        service.currentMap.size = consts.MEDIUM_MAP_SIZE;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < colIncrementLimit2; i++) service.addItem(rowIndex, colIndex + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + colIncrementLimit2, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should check for reached limit of items on large maps', () => {
        service.currentMap.size = consts.LARGE_MAP_SIZE;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < colIncrementLimit3; i++) service.addItem(rowIndex, colIndex + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + colIncrementLimit3, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    });

    it('should remove items', () => {
        service.initializeMap();
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        service.removeItem(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
    });

    it('should change tiles', () => {
        service.initializeMap();
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(rowIndex, colIndex, changedTile);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(TileTerrain.ICE);
    });

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
});
