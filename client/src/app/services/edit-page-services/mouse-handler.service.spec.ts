import { TestBed } from '@angular/core/testing';

import * as conversionConsts from '@app/constants/conversion.constants';
import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';

import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { Vec2 } from '@app/interfaces/vec2';
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

    const mockPosition: Vec2 = { x: 0, y: 0 };
    const mockPosition2: Vec2 = { x: 1, y: 1 };

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
        mapManagerServiceSpy.changeTile.and.callFake((mapPosition: Vec2, tileType: TileTerrain) => {
            mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x].terrain = tileType;
        });

        // addItem() Fake
        mapManagerServiceSpy.addItem.and.callFake((mapPosition: Vec2, item: Item) => {
            mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x].item = item;
            mapManagerServiceSpy.currentMap.placedItems.push(item);
        });

        // toggleDoor() Fake
        mapManagerServiceSpy.toggleDoor.and.callFake((mapPosition: Vec2) => {
            const tile = mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x];
            if (tile.terrain === TileTerrain.CLOSEDDOOR) {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.OPENDOOR);
            } else {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.CLOSEDDOOR);
            }
        });

        // removeItem() Fake
        mapManagerServiceSpy.removeItem.and.callFake((mapPosition: Vec2) => {
            const item: Item = mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x].item;
            mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x].item = Item.NONE;
            const index = mapManagerServiceSpy.currentMap.placedItems.indexOf(item);
            mapManagerServiceSpy.currentMap.placedItems.splice(index, 1);
        });
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
        service.draggedItemPosition = testConsts.addedItemPosition2;
        mapManagerServiceSpy.addItem(testConsts.addedItemPosition2, Item.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 150 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemPosition2);
        expect(service.draggedItemPosition).toBeNull();
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
        service.draggedItemPosition = testConsts.addedItemPosition2;
        mapManagerServiceSpy.addItem(testConsts.addedItemPosition2, Item.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 0 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemPosition2);
        expect(service.draggedItemPosition).toBeNull();
        document.body.removeChild(mapElement);
    });

    it('should change tile on left click on an empty tile', () => {
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseDownEmptyTile(mockLeftClick, mockPosition);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(mockPosition, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[mockPosition.y][mockPosition.x].terrain).toEqual(TileTerrain.ICE);
    });

    it('should revert tiles to grass on right click on an tile that has no item', () => {
        mapManagerServiceSpy.changeTile(mockPosition2, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1].terrain).toEqual(TileTerrain.ICE);
        service.onMouseDownEmptyTile(mockRightClick, mockPosition2);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1].terrain).toEqual(TileTerrain.GRASS);
    });

    it('should toggle door on click', () => {
        mapManagerServiceSpy.changeTile(testConsts.addedItemPosition4, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition4.y][testConsts.addedItemPosition4.x].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.addedItemPosition4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition4.y][testConsts.addedItemPosition4.x].terrain).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.addedItemPosition4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition4.y][testConsts.addedItemPosition4.x].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
    });

    it('should delete item on right click', () => {
        mapManagerServiceSpy.addItem(testConsts.addedItemPosition3, Item.BOOST1);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition3.y][testConsts.addedItemPosition3.x].item).toEqual(Item.BOOST1);
        service.onMouseDownItem(mockRightClick, testConsts.addedItemPosition3);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition3.y][testConsts.addedItemPosition3.x].item).toEqual(Item.NONE);
    });

    it('should change tile, but remove item if placing doors or walls', () => {
        mapManagerServiceSpy.selectedTileType = null;
        service.fullClickOnItem(testConsts.addedItemPosition5);
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.fullClickOnItem(testConsts.addedItemPosition5);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.addedItemPosition5, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition5.y][testConsts.addedItemPosition5.x].terrain).toEqual(
            TileTerrain.ICE,
        );
        mapManagerServiceSpy.addItem(testConsts.addedItemPosition5, Item.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.fullClickOnItem(testConsts.addedItemPosition5);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.addedItemPosition5, TileTerrain.WALL);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition5.y][testConsts.addedItemPosition5.x].terrain).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition5.y][testConsts.addedItemPosition5.x].item).toEqual(Item.NONE);
    });

    it('should prevent context menu appearing on right click', () => {
        spyOn(mockRightClick, 'preventDefault');
        service.preventRightClick(mockRightClick);
        expect(mockRightClick.preventDefault).toHaveBeenCalled();
    });

    it('should prevent drag over', () => {
        const mockEvent = new DragEvent('onDrag');
        spyOn(mockEvent, 'preventDefault');
        service.onDragOver(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call dragStart on drag start event', () => {
        mapManagerServiceSpy.addItem(testConsts.addedItemPosition2, Item.BOOST2);
        const mockDragStart = new DragEvent('dragstart') as unknown as DragEvent;
        const mockDataTransfer = {
            setData: jasmine.createSpy('setData'),
        };
        Object.defineProperty(mockDragStart, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition2.y][testConsts.addedItemPosition2.x].item).toEqual(Item.BOOST2);
        service.onDragStart(mockDragStart, testConsts.addedItemPosition2);
        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', conversionConsts.ITEM_TO_STRING_MAP[Item.BOOST2]);
    });

    it('should handle onDrop correctly', () => {
        const mockDropEvent = new DragEvent('drop') as unknown as DragEvent;

        const mockDataTransfer = {
            getData: jasmine.createSpy('getData').and.returnValue(conversionConsts.ITEM_TO_STRING_MAP[Item.BOOST2]),
        };

        Object.defineProperty(mockDropEvent, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });

        mapManagerServiceSpy.addItem(testConsts.addedItemPosition2, Item.BOOST2);
        service.draggedItemPosition = testConsts.addedItemPosition2;

        mapManagerServiceSpy.removeItem(testConsts.addedItemPosition2);

        service.onDrop(mockDropEvent, testConsts.addedItemPosition6);

        expect(mockDataTransfer.getData).toHaveBeenCalledWith('itemType');
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.addedItemPosition2);
        expect(mapManagerServiceSpy.addItem).toHaveBeenCalledWith(testConsts.addedItemPosition6, Item.BOOST2);
        expect(service.draggedItemPosition).toBeNull();
    });

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

    it('should properly implement mouseOver()', () => {
        service.wasItemDeleted = true;
        service.onMouseOver(mockRightClick, testConsts.mockClickPosition0);
        service.wasItemDeleted = false;

        mapManagerServiceSpy.changeTile(testConsts.addedItemPosition7, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseOver(mockLeftClick, testConsts.addedItemPosition7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseOver(mockLeftClick, testConsts.addedItemPosition7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.CLOSEDDOOR,
        );

        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseOver(mockLeftClick, testConsts.addedItemPosition7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.ICE,
        );

        mapManagerServiceSpy.addItem(testConsts.addedItemPosition7, Item.BOOST1);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].item).toEqual(Item.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.onMouseOver(mockLeftClick, testConsts.addedItemPosition7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].item).toEqual(Item.NONE);
    });

    it('should revert tiles back to grass on right click mouse over', () => {
        mapManagerServiceSpy.changeTile(testConsts.addedItemPosition7, TileTerrain.CLOSEDDOOR);

        service.onMouseOver(mockRightClick, testConsts.addedItemPosition7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.addedItemPosition7.y][testConsts.addedItemPosition7.x].terrain).toEqual(
            TileTerrain.GRASS,
        );
    });
});
