import { TestBed } from '@angular/core/testing';

import * as consts from '@app/constants/edit-page-consts';
import { MapManagerService } from './map-manager.service';
import { MouseHandlerService } from './mouse-handler.service';
import SpyObj = jasmine.SpyObj;

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;

    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['selectTileType', 'isItemLimitReached', 'addItem'], {});
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MouseHandlerService],
        });
        service = TestBed.inject(MouseHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    it('should prevent context menu appearing on right click', () => {
        const mockEvent = new MouseEvent('contextmenu', {
            buttons: consts.MOUSE_RIGHT_CLICK_FLAG,
        });
        spyOn(mockEvent, 'preventDefault');
        service.preventRightClick(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should prevent drag over', () => {
        const mockEvent = new DragEvent('onDrag');
        spyOn(mockEvent, 'preventDefault');
        service.onDragOver(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
});
