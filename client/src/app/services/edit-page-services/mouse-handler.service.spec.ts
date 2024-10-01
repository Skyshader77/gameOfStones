import { TestBed } from '@angular/core/testing';

import * as conversionConsts from '@app/constants/conversion-consts';
import * as consts from '@app/constants/edit-page-consts';
import * as testConsts from '@app/constants/tests.constants';

import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MouseHandlerService } from './mouse-handler.service';

import SpyObj = jasmine.SpyObj;

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;

    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const currentMap: CreationMap = {
        name: 'mapName',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
        imageData: '',
    };

    const mockLeftClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_LEFT_CLICK_FLAG,
    });

    const mockRightClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_RIGHT_CLICK_FLAG,
    });

    const mockRowIndex = 0;
    const mockColIndex = 0;

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            ['selectTileType', 'isItemLimitReached', 'initializeMap', 'changeTile', 'addItem', 'toggleDoor', 'removeItem'],
            { currentMap },
        );

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MouseHandlerService],
        });
        service = TestBed.inject(MouseHandlerService);

        // changeTile() Fake
        mapManagerServiceSpy.changeTile.and.callFake((rowIndex: number, colIndex: number, tileType: TileTerrain) => {
            mapManagerServiceSpy.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
        });

        // addItem() Fake
        mapManagerServiceSpy.addItem.and.callFake((rowIndex: number, colIndex: number, item: Item) => {
            mapManagerServiceSpy.currentMap.mapArray[rowIndex][colIndex].item = item;
            mapManagerServiceSpy.currentMap.placedItems.push(item);
        });

        // toggleDoor() Fake
        mapManagerServiceSpy.toggleDoor.and.callFake((rowIndex: number, colIndex: number) => {
            const tile = mapManagerServiceSpy.currentMap.mapArray[rowIndex][colIndex];
            if (tile.terrain === TileTerrain.CLOSEDDOOR) {
                mapManagerServiceSpy.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
            } else {
                mapManagerServiceSpy.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
            }
        });

        // removeItem() Fake
        mapManagerServiceSpy.removeItem.and.callFake((rowIndex: number, colIndex: number) => {
            const item: Item = mapManagerServiceSpy.currentMap.mapArray[rowIndex][colIndex].item;
            mapManagerServiceSpy.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;
            const index = mapManagerServiceSpy.currentMap.placedItems.indexOf(item);
            mapManagerServiceSpy.currentMap.placedItems.splice(index, 1);
        });
    });

    // onDragEnd()
    it('should remove the dragged item if dragged outside the map boundaries', () => {
        const mockDragEndEvent = new DragEvent('dragend') as unknown as DragEvent;
        const mapElement = document.createElement('div');
        mapElement.classList.add('map-container');
        document.body.appendChild(mapElement);
        Object.defineProperty(mapElement, 'getBoundingClientRect', {
            value: () => ({
                left: 0,
                right: 100,
                top: 0,
                bottom: 100,
            }),
        });
        service.draggedItemInitRow = 7;
        service.draggedItemInitCol = 7;
        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2, Item.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 150 }); // Outside the right boundary
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 }); // Outside the bottom boundary
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2); // Check if the item was removed
        expect(service.draggedItemInitRow).toBeNull(); // Ensure dragged item row is reset
        expect(service.draggedItemInitCol).toBeNull(); // Ensure dragged item column is reset
        document.body.removeChild(mapElement);
    });

    it('should remove the dragged item if dragged outside the map boundaries', () => {
        const mockDragEndEvent = new DragEvent('dragend') as unknown as DragEvent;
        const mapElement = document.createElement('div');
        mapElement.classList.add('map-container');
        document.body.appendChild(mapElement);
        Object.defineProperty(mapElement, 'getBoundingClientRect', {
            value: () => ({
                left: 0,
                right: 100,
                top: 0,
                bottom: 100,
            }),
        });
        service.draggedItemInitRow = testConsts.addedItemRowIndex2;
        service.draggedItemInitCol = testConsts.addedItemColIndex2;
        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2, Item.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 0 }); // Outside the right boundary
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 }); // Outside the bottom boundary
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2); // Check if the item was removed
        expect(service.draggedItemInitRow).toBeNull(); // Ensure dragged item row is reset
        expect(service.draggedItemInitCol).toBeNull(); // Ensure dragged item column is reset
        document.body.removeChild(mapElement);
    });

    // onMouseDownEmptyTile()
    it('should change tile on left click on an empty tile', () => {
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseDownEmptyTile(mockLeftClick, mockRowIndex, mockColIndex);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(0, 0, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[mockRowIndex][mockColIndex].terrain).toEqual(TileTerrain.ICE);
    });

    it('should revert tiles to grass on right click on an tile that has no item', () => {
        mapManagerServiceSpy.changeTile(1, 1, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1].terrain).toEqual(TileTerrain.ICE);
        service.onMouseDownEmptyTile(mockRightClick, 1, 1);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1].terrain).toEqual(TileTerrain.GRASS);
    });

    it('should toggle door on click', () => {
        mapManagerServiceSpy.changeTile(testConsts.addedItemRowIndex4, testConsts.addedItemRowIndex4, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex4][testConsts.addedItemColIndex4].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.addedItemRowIndex4, testConsts.addedItemColIndex4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex4][testConsts.addedItemColIndex4].terrain).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.addedItemRowIndex4, testConsts.addedItemColIndex4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex4][testConsts.addedItemColIndex4].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
    });

    // onMouseDownItem()
    it('should delete item on right click', () => {
        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex3, testConsts.addedItemColIndex3, Item.BOOST1);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex3][testConsts.addedItemColIndex3].item).toEqual(Item.BOOST1);
        service.onMouseDownItem(mockRightClick, testConsts.addedItemRowIndex3, testConsts.addedItemColIndex3);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex3][testConsts.addedItemColIndex3].item).toEqual(Item.NONE);
    });

    // fullClickOnItem()
    it('should change tile, but remove item if placing doors or walls', () => {
        mapManagerServiceSpy.selectedTileType = null;
        service.fullClickOnItem(mockLeftClick, testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5);
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.fullClickOnItem(mockLeftClick, testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex5][testConsts.addedItemColIndex5].terrain).toEqual(
            TileTerrain.ICE,
        );
        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5, Item.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.fullClickOnItem(mockLeftClick, testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.addedItemRowIndex5, testConsts.addedItemColIndex5, TileTerrain.WALL);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex5][testConsts.addedItemColIndex5].terrain).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex5][testConsts.addedItemColIndex5].item).toEqual(Item.NONE);
    });

    // preventRightClick()
    it('should prevent context menu appearing on right click', () => {
        spyOn(mockRightClick, 'preventDefault');
        service.preventRightClick(mockRightClick);
        expect(mockRightClick.preventDefault).toHaveBeenCalled();
    });

    // onDragOver()
    it('should prevent drag over', () => {
        const mockEvent = new DragEvent('onDrag');
        spyOn(mockEvent, 'preventDefault');
        service.onDragOver(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    // onDragStart()
    it('should call dragStart on drag start event', () => {
        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2, Item.BOOST2);
        const mockDragStart = new DragEvent('dragstart') as unknown as DragEvent;
        const mockDataTransfer = {
            setData: jasmine.createSpy('setData'),
        };
        Object.defineProperty(mockDragStart, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false, // Prevent further modifications
        });
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex2][testConsts.addedItemColIndex2].item).toEqual(Item.BOOST2);
        service.onDragStart(mockDragStart, testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2);
        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', conversionConsts.itemToStringMap[Item.BOOST2]);
    });

    // onDrop()
    it('should handle onDrop correctly', () => {
        const mockDropEvent = new DragEvent('drop') as unknown as DragEvent;

        const mockDataTransfer = {
            getData: jasmine.createSpy('getData').and.returnValue(conversionConsts.itemToStringMap[Item.BOOST2]),
        };

        Object.defineProperty(mockDropEvent, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });

        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2, Item.BOOST2);
        service.draggedItemInitRow = testConsts.addedItemRowIndex2;
        service.draggedItemInitCol = testConsts.addedItemColIndex2;

        mapManagerServiceSpy.removeItem(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2);

        service.onDrop(mockDropEvent, testConsts.addedItemRowIndex6, testConsts.addedItemColIndex6);

        expect(mockDataTransfer.getData).toHaveBeenCalledWith('itemType');
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemRowIndex2, testConsts.addedItemColIndex2); // Check if the original item was removed
        expect(mapManagerServiceSpy.addItem).toHaveBeenCalledWith(testConsts.addedItemRowIndex6, testConsts.addedItemColIndex6, Item.BOOST2); // Check if the item was added to the new position
        expect(service.draggedItemInitRow).toBeNull(); // Check if dragged item initial row was reset
        expect(service.draggedItemInitCol).toBeNull(); // Check if dragged item initial column was reset
    });

    // onMouseUp()
    it('should properly release mouse buttons', () => {
        service.isLeftClick = true;
        service.onMouseUp();
        expect(service.isLeftClick).toBeFalse();
        service.isRightClick = true;
        service.onMouseUp();
        expect(service.isRightClick).toBeFalse();
        service.wasItemDeleted = true;
        service.onMouseUp();
        expect(service.wasItemDeleted).toBeFalse();
    });

    // onMouseOver()
    it('should properly implement mouseOver()', () => {
        service.wasItemDeleted = true;
        service.onMouseOver(mockRightClick, testConsts.mockClickIndex0, testConsts.mockClickIndex0);
        service.wasItemDeleted = false;

        mapManagerServiceSpy.changeTile(testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseOver(mockLeftClick, testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseOver(mockLeftClick, testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );

        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseOver(mockLeftClick, testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.ICE,
        );

        mapManagerServiceSpy.addItem(testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7, Item.BOOST1);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].item).toEqual(Item.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.onMouseOver(mockLeftClick, testConsts.addedItemRowIndex7, testConsts.addedItemColIndex7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemRowIndex7][testConsts.addedItemColIndex7].item).toEqual(Item.NONE);
    });

    it('should revert tiles back to grass on right click mouse over', () => {
        mapManagerServiceSpy.changeTile(testConsts.addedItemColIndex7, testConsts.addedItemColIndex7, TileTerrain.CLOSEDDOOR);

        service.onMouseOver(mockRightClick, testConsts.addedItemColIndex7, testConsts.addedItemColIndex7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemColIndex7][testConsts.addedItemColIndex7].terrain).toEqual(
            TileTerrain.GRASS,
        );
    });
});
