import { TestBed } from '@angular/core/testing';

import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MouseHandlerService } from './mouse-handler.service';
import SpyObj = jasmine.SpyObj;

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;

    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const currentMap: CreationMap = {
        name: 'mapName',
        description: '',
        size: consts.SMALL_MAP_SIZE,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: consts.SMALL_MAP_SIZE }, () =>
            Array.from({ length: consts.SMALL_MAP_SIZE }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj(
            'MapManagerService',
            ['selectTileType', 'isItemLimitReached', 'addItem', 'initializeMap', 'changeTile'],
            { currentMap: currentMap },
        );

        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MouseHandlerService],
        });
        service = TestBed.inject(MouseHandlerService);
    });

    it('should change tile on left click', () => {
        const mockEvent = new MouseEvent('mouseDown', {
            buttons: consts.MOUSE_LEFT_CLICK_FLAG,
        });
        mapManagerServiceSpy.changeTile.and.callFake((x: number, y: number, terrain: TileTerrain) => {
            mapManagerServiceSpy.currentMap.mapArray[x][y].terrain = terrain;
        });
        mapManagerServiceSpy.selectedTileType = TileTerrain.ICE;
        service.onMouseDownEmptyTile(mockEvent, 0, 0);
        expect(mapManagerServiceSpy.changeTile).toHaveBeenCalledWith(0, 0, TileTerrain.ICE);

        expect(mapManagerServiceSpy.currentMap.mapArray[0][0].terrain).toEqual(TileTerrain.ICE);
    });
});
