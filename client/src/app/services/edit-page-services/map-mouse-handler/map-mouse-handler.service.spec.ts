import { TestBed } from '@angular/core/testing';

import * as conversionConsts from '@app/constants/conversion.constants';
import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';

import { MapManagerService } from '@app/services/edit-page-services/map-manager/map-manager.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { CreationMap } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
import { MapMouseHandlerService } from './map-mouse-handler.service';

import SpyObj = jasmine.SpyObj;

describe('MapMouseHandlerService', () => {
    let service: MapMouseHandlerService;

    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const mockLeftClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_LEFT_CLICK_FLAG,
    });

    const mockRightClick = new MouseEvent('mouseDown', {
        buttons: consts.MOUSE_RIGHT_CLICK_FLAG,
    });

    const mockPosition2: Vec2 = { x: 1, y: 1 };

    beforeEach(() => {
        const currentMap: CreationMap = {
            name: 'mapName',
            description: '',
            size: MapSize.Small,
            mode: GameMode.Normal,
            mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
            placedItems: [],
            imageData: '',
        };
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            [
                'selectTileType',
                'isItemLimitReached',
                'getItemType',
                'initializeMap',
                'changeTile',
                'addItem',
                'toggleDoor',
                'removeItem',
                'getTileAtPosition',
                'getItemAtPosition',
            ],

            { currentMap },
        );

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapMouseHandlerService],
        });
        service = TestBed.inject(MapMouseHandlerService);

        mapManagerServiceSpy.changeTile.and.callFake((mapPosition: Vec2, tileType: TileTerrain) => {
            mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x] = tileType;
        });

        mapManagerServiceSpy.getItemType.and.callFake((mapPosition: Vec2) => {
            return (
                mapManagerServiceSpy.currentMap.placedItems.find((item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y)
                    ?.type ?? null
            );
        });

        mapManagerServiceSpy.addItem.and.callFake((mapPosition: Vec2, item: ItemType) => {
            mapManagerServiceSpy.currentMap.placedItems.push({
                position: mapPosition,
                type: item,
            });
        });

        mapManagerServiceSpy.toggleDoor.and.callFake((mapPosition: Vec2) => {
            const tile = mapManagerServiceSpy.currentMap.mapArray[mapPosition.y][mapPosition.x];
            if (tile === TileTerrain.ClosedDoor) {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.OpenDoor);
            } else {
                mapManagerServiceSpy.changeTile(mapPosition, TileTerrain.ClosedDoor);
            }
        });

        mapManagerServiceSpy.removeItem.and.callFake((mapPosition: Vec2) => {
            mapManagerServiceSpy.currentMap.placedItems = mapManagerServiceSpy.currentMap.placedItems.filter(
                (item) => !(item.position.x === mapPosition.x && item.position.y === mapPosition.y),
            );
        });

        mapManagerServiceSpy.getTileAtPosition.and.callFake((position: Vec2) => {
            return currentMap.mapArray[position.y][position.x];
        });

        mapManagerServiceSpy.getItemAtPosition.and.callFake((position: Vec2) => {
            return currentMap.placedItems.find((item) => item.position.x === position.x && item.position.y === position.y);
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
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.GlassStone);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 150 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
        expect(service.draggedItemPosition).toBeNull();
        document.body.removeChild(mapElement);
    });

    it('should return early if map element does not exist on drag end', () => {
        const mockDragEndEvent = new DragEvent('dragend') as unknown as DragEvent;

        const mapElement = document.querySelector('.map-container');
        if (mapElement) {
            document.body.removeChild(mapElement);
        }

        service.onDragEnd(mockDragEndEvent);

        expect(mapManagerServiceSpy.removeItem).not.toHaveBeenCalled();
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
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.GlassStone);
        Object.defineProperty(mockDragEndEvent, 'clientX', { value: 0 });
        Object.defineProperty(mockDragEndEvent, 'clientY', { value: 150 });
        service.onDragEnd(mockDragEndEvent);
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
        expect(service.draggedItemPosition).toBeNull();
        document.body.removeChild(mapElement);
    });

    it('should change tile on left click on an empty tile', () => {
        mapManagerServiceSpy.selectedTileType = TileTerrain.Ice;
        mapManagerServiceSpy.getTileAtPosition.and.returnValue(TileTerrain.Grass);

        service.onMouseDownEmptyTile(mockLeftClick, testConsts.MOCK_CLICK_POSITION_0);

        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.MOCK_CLICK_POSITION_0, TileTerrain.Ice);
        const updatedTile = mapManagerServiceSpy.getTileAtPosition(testConsts.MOCK_CLICK_POSITION_0);
        expect(updatedTile).toEqual(TileTerrain.Grass);
    });

    it('should revert tiles to grass on right click on an tile that has no item', () => {
        mapManagerServiceSpy.changeTile(mockPosition2, TileTerrain.Ice);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1]).toEqual(TileTerrain.Ice);
        service.onMouseDownEmptyTile(mockRightClick, mockPosition2);
        expect(mapManagerServiceSpy.currentMap.mapArray[1][1]).toEqual(TileTerrain.Grass);
    });

    it('should toggle door on click', () => {
        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_4, TileTerrain.ClosedDoor);
        expect(mapManagerServiceSpy.getTileAtPosition(testConsts.ADDED_ITEM_POSITION_4)).toEqual(TileTerrain.ClosedDoor);

        mapManagerServiceSpy.selectedTileType = TileTerrain.ClosedDoor;

        service.onMouseDownEmptyTile(mockLeftClick, testConsts.ADDED_ITEM_POSITION_4);
        expect(mapManagerServiceSpy.getTileAtPosition(testConsts.ADDED_ITEM_POSITION_4)).toEqual(TileTerrain.OpenDoor);

        service.onMouseDownEmptyTile(mockLeftClick, testConsts.ADDED_ITEM_POSITION_4);
        expect(mapManagerServiceSpy.getTileAtPosition(testConsts.ADDED_ITEM_POSITION_4)).toEqual(TileTerrain.ClosedDoor);
    });

    it('should delete item on right click', () => {
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_3, ItemType.BismuthShield);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_3)).toEqual(ItemType.BismuthShield);
        service.onMouseDownItem(mockRightClick, testConsts.ADDED_ITEM_POSITION_3);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_3)).toEqual(null);
    });

    it('should change tile, but remove item if placing doors or walls', () => {
        mapManagerServiceSpy.selectedTileType = null;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        mapManagerServiceSpy.selectedTileType = TileTerrain.Ice;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, TileTerrain.Ice);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_6.y][testConsts.ADDED_ITEM_POSITION_6.x]).toEqual(
            TileTerrain.Ice,
        );
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_6, ItemType.BismuthShield);
        mapManagerServiceSpy.selectedTileType = TileTerrain.Wall;
        service.fullClickOnItem(testConsts.ADDED_ITEM_POSITION_6);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, TileTerrain.Wall);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_6.y][testConsts.ADDED_ITEM_POSITION_6.x]).toEqual(
            TileTerrain.Wall,
        );
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_6)).toEqual(null);
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
        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.GlassStone);
        const mockDragStart = new DragEvent('dragstart') as unknown as DragEvent;
        const mockDataTransfer = {
            setData: jasmine.createSpy('setData'),
        };
        Object.defineProperty(mockDragStart, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_2)).toEqual(ItemType.GlassStone);
        service.onDragStart(mockDragStart, testConsts.ADDED_ITEM_POSITION_2);
        expect(mockDataTransfer.setData).toHaveBeenCalledWith('itemType', conversionConsts.ITEM_TO_STRING_MAP[ItemType.GlassStone]);
    });

    it('should handle onDrop correctly', () => {
        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);
        const mockDropEvent = new DragEvent('drop');

        const mockDataTransfer = {
            getData: jasmine.createSpy('getData').and.returnValue(conversionConsts.ITEM_TO_STRING_MAP[ItemType.GlassStone]),
        };

        Object.defineProperty(mockDropEvent, 'dataTransfer', {
            value: mockDataTransfer,
            writable: false,
        });

        mapManagerServiceSpy.isItemLimitReached.and.returnValue(false);

        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_2, ItemType.GlassStone);
        service.draggedItemPosition = testConsts.ADDED_ITEM_POSITION_2;

        mapManagerServiceSpy.removeItem(testConsts.ADDED_ITEM_POSITION_2);

        service.onDrop(mockDropEvent, testConsts.ADDED_ITEM_POSITION_6);

        expect(mockDataTransfer.getData).toHaveBeenCalledWith('itemType');
        expect(mapManagerServiceSpy.removeItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_2);
        expect(mapManagerServiceSpy.addItem).toHaveBeenCalledWith(testConsts.ADDED_ITEM_POSITION_6, ItemType.GlassStone);
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

        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_7, TileTerrain.ClosedDoor);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.ClosedDoor,
        );
        mapManagerServiceSpy.selectedTileType = TileTerrain.ClosedDoor;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.OpenDoor,
        );
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.ClosedDoor,
        );

        mapManagerServiceSpy.selectedTileType = TileTerrain.Ice;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.Ice,
        );

        mapManagerServiceSpy.addItem(testConsts.ADDED_ITEM_POSITION_7, ItemType.BismuthShield);
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_7)).toEqual(ItemType.BismuthShield);
        mapManagerServiceSpy.selectedTileType = TileTerrain.Wall;
        service.onMouseOver(mockLeftClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.Wall,
        );
        expect(mapManagerServiceSpy.getItemType(testConsts.ADDED_ITEM_POSITION_7)).toEqual(null);
    });

    it('should revert tiles back to grass on right click mouse over', () => {
        mapManagerServiceSpy.changeTile(testConsts.ADDED_ITEM_POSITION_7, TileTerrain.ClosedDoor);

        service.onMouseOver(mockRightClick, testConsts.ADDED_ITEM_POSITION_7);
        expect(mapManagerServiceSpy.currentMap.mapArray[testConsts.ADDED_ITEM_POSITION_7.y][testConsts.ADDED_ITEM_POSITION_7.x]).toEqual(
            TileTerrain.Grass,
        );
    });

    it('should return early if selectedTileType is falsy', () => {
        const mapPosition: Vec2 = { x: 1, y: 2 };
        const tile: TileTerrain = TileTerrain.Grass;
        const tileItem: Item = { position: { x: 0, y: 0 }, type: ItemType.BismuthShield };

        mapManagerServiceSpy.selectedTileType = undefined as unknown as TileTerrain;

        service['handleLeftClick'](mapPosition, tile, tileItem);

        expect(mapManagerServiceSpy.toggleDoor).not.toHaveBeenCalled();
        expect(mapManagerServiceSpy.changeTile).not.toHaveBeenCalled();
        expect(mapManagerServiceSpy.removeItem).not.toHaveBeenCalled();
    });
});
