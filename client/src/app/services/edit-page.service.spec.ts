import { TestBed } from '@angular/core/testing';

import { EditPageService } from './edit-page.service';
import { Tile, TileTerrain, Item } from '@app/interfaces/map';

import * as CONSTS from '../constants/edit-page-consts';

describe('EditPageService', () => {
    let service: EditPageService;

    const mockSmallMapGrid: Tile[][] = Array.from({ length: CONSTS.SMALL_MAP_SIZE }, () =>
        Array.from({ length: CONSTS.SMALL_MAP_SIZE }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
    );;

    const addedItem: Item = Item.BOOST1;
    const addedRandomItem: Item = Item.RANDOM;
    const rowIndex = 5;
    const colIndex = 5;
    
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EditPageService);
        
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the map', () => {
        
        service.initializeMap();
        expect(service.currentMap.mapArray).toEqual(mockSmallMapGrid);
        expect(service.originalMap).toEqual(service.currentMap);
    });

    it('should add items', () => {
        service.initializeMap();
        const previousPlacedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(addedItem);
        expect(service.currentMap.placedItems.length).toEqual(previousPlacedItemsLength + 1);

    })

    it('should check for reached limit of items on small maps', () => {
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        service.addItem(rowIndex, colIndex, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + 1, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    })

    it('should check for reached limit of items on medium maps', () => {
        service.currentMap.rowSize = CONSTS.MEDIUM_MAP_SIZE;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < 3; i++) 
            service.addItem(rowIndex, colIndex + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, colIndex + 3, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    })

    it('should check for reached limit of items on large maps', () => {
        service.currentMap.rowSize = CONSTS.LARGE_MAP_SIZE;
        service.initializeMap();
        service.addItem(rowIndex, colIndex, addedItem);
        expect(service.isItemLimitReached(addedItem)).toEqual(true);
        for (let i = 0; i < 5; i++) 
            service.addItem(rowIndex, 4 + i, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(false);
        service.addItem(rowIndex, 4 + 5, addedRandomItem);
        expect(service.isItemLimitReached(addedRandomItem)).toEqual(true);
    })

    it('should remove items', () => {
        service.initializeMap();
        const placedItemsLength = service.currentMap.placedItems.length;
        service.addItem(rowIndex, colIndex, addedItem);
        service.removeItem(rowIndex, colIndex);
        expect(service.currentMap.mapArray[rowIndex][colIndex].item).toEqual(Item.NONE);
        expect(service.currentMap.placedItems.length).toEqual(placedItemsLength);
     })

    it('should check if whole map is accessible', () => {
        service.initializeMap();
        expect(service.isWholeMapAccessible()).toEqual(true);
    })

    
    it('should change tiles', () => {
        service.initializeMap();
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.selectedTileType = changedTile;
        service.changeTile(rowIndex, colIndex, changedTile);
        expect(service.currentMap.mapArray[rowIndex][colIndex].terrain).toEqual(TileTerrain.ICE);
    })

    it('should reset the map', () => {
        service.initializeMap();
        let wasReset: boolean = true;
        const changedTile: TileTerrain = TileTerrain.ICE;
        service.addItem(rowIndex, colIndex, addedItem);
        service.selectedTileType = changedTile;
        service.changeTile(rowIndex + 1, colIndex, changedTile);
        service.resetMap();

        for (let row = 0; row < service.currentMap.rowSize; row++) {
            for (let col = 0; col < service.currentMap.rowSize; col++) {
                const currentTile = service.currentMap.mapArray[row][col];
                if (currentTile.terrain !== TileTerrain.GRASS) {
                    wasReset = false;
                }
            }
        }
        expect(wasReset).toEqual(true);
    })

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

    it('should check if door surroundings are valid', () => {
        service.initializeMap();
        expect(service.isDoorSurroundingValid()).toEqual(true);
        const openDoor: TileTerrain = TileTerrain.OPENDOOR;
        service.selectedTileType = openDoor;
        service.changeTile(0, 0, openDoor);
        expect(service.isDoorSurroundingValid()).toEqual(false);
    });

    it('should check if door and wall amount is valid', () => {
        service.initializeMap();
        const wall: TileTerrain = TileTerrain.WALL;
        const closedDoor: TileTerrain = TileTerrain.CLOSEDDOOR;
        service.selectedTileType = wall;
        for (let row = 0; row < 3; row ++) {
            for (let col = 0; col < service.currentMap.rowSize; col ++) {
                service.changeTile(row, col, wall);
            }
        }
        service.selectedTileType = closedDoor;
        for (let row = 3; row < 5; row ++) {
            for (let col = 0; col < service.currentMap.rowSize - 1; col ++) {
                service.changeTile(row, col, closedDoor);
            }
        }
        expect(service.isDoorAndWallNumberValid()).toEqual(true);
        service.changeTile(service.currentMap.rowSize - 1, service.currentMap.rowSize - 1, closedDoor);
        service.changeTile(service.currentMap.rowSize - 1, service.currentMap.rowSize - 2, closedDoor);
        expect(service.isDoorAndWallNumberValid()).toEqual(false);
    });

    // it('should convert strings to Items', () => {
    //     const testItemString: string = 'potionBlue';
    //     const testItem: Item = Item.BOOST1;
    
    //     expect(service.convertStringToItem(testItemString)).toEqual(testItem);
    // })

    // it('should convert strings to Terrain', () => {
    //     const testTerrainString: string = 'grass';
    //     const testTerrain: TileTerrain = TileTerrain.GRASS;
    //     expect(service.convertStringToTerrain(testTerrainString)).toEqual(testTerrain);
    // })

    // it('should convert Items to strings', () => {
    //     const testItemString: string = 'potionBlue';
    //     const testItem: Item = Item.BOOST1;
    //     expect(service.convertItemToString(testItem)).toEqual(testItemString);
    // })

    // it('should convert Terrain to strings', () => {
    //     const testTerrainString: string = 'grass';
    //     const testTerrain: TileTerrain = TileTerrain.GRASS;
    //     expect(service.convertTerrainToString(testTerrain)).toEqual(testTerrainString);
    // })
});
