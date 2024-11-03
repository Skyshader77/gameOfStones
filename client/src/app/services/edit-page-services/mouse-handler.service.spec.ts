import { TestBed } from '@angular/core/testing';

import * as conversionConsts from '@app/constants/conversion.constants';
import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';

import { Vec2 } from '@common/interfaces/vec2';
import { MapManagerService } from './map-manager.service';
import { MouseHandlerService } from './mouse-handler.service';

import SpyObj = jasmine.SpyObj;
import { CreationMap } from '@common/interfaces/map';
import { MapSize } from '@common/enums/map-size.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;

    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const mockLeftClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_LEFT_CLICK_FLAG,
    });

    const mockRightClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_RIGHT_CLICK_FLAG,
    });

    const mockPosition: Vec2 = { x: 0, y: 0 };
    const mockPosition2: Vec2 = { x: 1, y: 1 };

    beforeEach(() => {
        const currentMap: CreationMap = {
            name: 'mapName',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: Array.from({ length: MapSize.SMALL }, () => Array.from({ length: MapSize.SMALL }, () => TileTerrain.GRASS)),
            placedItems: [],
            imageData: '',
        };
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            ['selectTileType', 'isItemLimitReached', 'getItemType', 'initializeMap', 'changeTile', 'addItem', 'toggleDoor', 'removeItem'],
            { currentMap },
        );

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MouseHandlerService],
        });
        service = TestBed.inject(MouseHandlerService);

        mapManagerServiceSpy.changeTile.and.callFake((mapPosition: Vec2, tileType: TileTerrain) => {
            mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x] = tileType;
        });

        mapManagerServiceSpy.getItemType.and.callFake((mapPosition: Vec2) => {
            const type = mapManagerServiceSpy.currentMap.placedItems.find(
                (item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
            )?.type;
            return type !== undefined ? type : ItemType.NONE;
        });

        mapManagerServiceSpy.addItem.and.callFake((mapPosition: Vec2, item: ItemType) => {
            mapManagerServiceSpy.currentMap.placedItems.push({
                position: mapPosition,
                type: item,
            });
        });

        mapManagerServiceSpy.toggleDoor.and.callFake((mapPosition: Vec2) => {
            const tile = mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x];
            if (tile === TileTerrain.CLOSEDDOOR) {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.OPENDOOR);
            } else {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.CLOSEDDOOR);
            }
        });

        mapManagerServiceSpy.removeItem.and.callFake((mapPosition: Vec2) => {
            mapManagerServiceSpy.currentMap.placedItems = mapManagerServiceSpy.currentMap.placedItems.filter(
                (item) => !(item.position.x === mapPosition.x && item.position.y === mapPosition.y),
            );
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
        service.draggedItemPosition = testConsts.ADDED_ITEM_POSITION_2;
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 150 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
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
        service.draggedItemPosition = testConsts.ADDED_ITEM_POSITION_2;
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.BOOST2);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 0 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
        expect(service.draggedItemPosition).toBeNull();
        document.body.removeChild(mapElement);
    });

    it('should change tile on left click on an empty tile', () => {
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseDownEmptyTile(mockLeftClick, mockPosition);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(mockPosition, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[mockPosition.y][mockPosition.x]).toEqual(TileTerrain.ICE);
    });

    it('should revert tiles to grass on right click on an tile that has no item', () => {
        mapManagerServiceSpy.changeTile(mockPosition2, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1]).toEqual(TileTerrain.ICE);
        service.onMouseDownEmptyTile(mockRightClick, mockPosition2);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1]).toEqual(TileTerrain.GRASS);
    });

    it('should toggle door on click', () => {
        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_4, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_4.y][testConsts.ADDED_ITEM_POSITION_4.x]).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.ADDED_ITEM_POSITION_4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_4.y][testConsts.ADDED_ITEM_POSITION_4.x]).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseDownEmptyTile(mockLeftClick, testConsts.ADDED_ITEM_POSITION_4);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_4.y][testConsts.ADDED_ITEM_POSITION_4.x]).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
    });

    it('should delete item on right click', () => {
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_3, ItemType.BOOST1);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_3)).toEqual(ItemType.BOOST1);
        service.onMouseDownItem(mockRightClick, testConsts.ADDED_ITEM_POSITION_3);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_3)).toEqual(ItemType.NONE);
    });

    it('should change tile, but remove item if placing doors or walls', () => {
        mapManagerServiceSpy.selectedTileType = null;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, TileTerrain.ICE);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_6.y][testConsts.ADDED_ITEM_POSITION_6.x]).toEqual(
            TileTerrain.ICE,
        );
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_6, ItemType.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, TileTerrain.WALL);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_6.y][testConsts.ADDED_ITEM_POSITION_6.x]).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_6)).toEqual(ItemType.NONE);
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
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.BOOST2);
        const mockDragStart = new DragEvent('dragstart') as unknown as DragEvent;
        const mockDataTransfer = {
            setData: jasmine.createSpy('setData'),
        };
        Object.defineProperty(mockDragStart, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_2)).toEqual(ItemType.BOOST2);
        service.onDragStart(mockDragStart, testConsts.ADDED_ITEM_POSITION_2);
        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', conversionConsts.ITEM_TO_STRING_MAP[ItemType.BOOST2]);
    });

    it('should handle onDrop correctly', () => {
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        const mockDropEvent = new DragEvent('drop');

        const mockDataTransfer = {
            getData: jasmine.createSpy('getData').and.returnValue(conversionConsts.ITEM_TO_STRING_MAP[ItemType.BOOST2]),
        };

        Object.defineProperty(mockDropEvent, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });

        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);

        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.BOOST2);
        service.draggedItemPosition = testConsts.ADDED_ITEM_POSITION_2;

        mapManagerServiceSpy.removeItem(testConsts.ADDED_ITEM_POSITION_2);

        service.onDrop(mockDropEvent, testConsts.ADDED_ITEM_POSITION_6);

        expect(mockDataTransfer.getData).toHaveBeenCalledWith('itemType');
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
        expect(mapManagerServiceSpy.addItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, ItemType.BOOST2);
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
        service.onMouseOver(mockRightClick, testConsts.MOCK_CLICK_POSITION_0);
        service.wasItemDeleted = false;

        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_7, TileTerrain.CLOSEDDOOR);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.CLOSEDDOOR,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.CLOSEDDOOR;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.OPENDOOR,
        );
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.CLOSEDDOOR,
        );

        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.ICE,
        );

        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_7, ItemType.BOOST1);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_7)).toEqual(ItemType.BOOST1);
        mapManagerServiceSpy.selectedTileType = TileTerrain.WALL;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.WALL,
        );
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_7)).toEqual(ItemType.NONE);
    });

    it('should revert tiles back to grass on right click mouse over', () => {
        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_7, TileTerrain.CLOSEDDOOR);

        service.onMouseOver(mockRightClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.GRASS,
        );
    });
});
