import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('MapComponent', () => {
    const mockMapGrassOnly: CreationMap = {
        name: 'Mock Map 1',
        description: '',
        size: 0,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: consts.SMALL_MAP_SIZE }, () =>
            Array.from({ length: consts.SMALL_MAP_SIZE }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    const mockClickIndex0 = 0;
    const mockClickIndex1 = 1;
    const mockClickIndex2 = 2;
    const mockClickIndex3 = 3;
    const mockClickIndex4 = 4;
    let component: MapComponent;
    let mouseHandlerServiceSpy: SpyObj<MouseHandlerService>;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let fixture: ComponentFixture<MapComponent>;
    beforeEach(async () => {
        mouseHandlerServiceSpy = jasmine.createSpyObj(
            'MouseHandlerService',
            ['onMouseDownEmptyTile', 'onMouseDownItem', 'onDrop', 'onMouseUp', 'onMouseOver', 'onDragStart', 'onDragEnd', 'fullClickOnItem'],
            {},
        );
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['getMapSize'], { currentMap: mockMapGrassOnly });
        TestBed.overrideProvider(MouseHandlerService, { useValue: mouseHandlerServiceSpy });
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getMapSize on initialization', () => {
        component.ngOnInit();
        expect(mapManagerServiceSpy.getMapSize).toHaveBeenCalled();
    });

    it('should call onMouseDownEmptyTile on mouse down', () => {
        const event = new MouseEvent('mousedown');
        component.onMouseDownEmptyTile(event, mockClickIndex0, mockClickIndex0);
        expect(mouseHandlerServiceSpy.onMouseDownEmptyTile).toHaveBeenCalledWith(event, mockClickIndex0, mockClickIndex0);
    });

    it('should call onMouseDownItem on mouse down on an item', () => {
        const event = new MouseEvent('mousedown');
        component.onMouseDownItem(event, mockClickIndex1, mockClickIndex1);
        expect(mouseHandlerServiceSpy.onMouseDownItem).toHaveBeenCalledWith(event, mockClickIndex1, mockClickIndex1);
    });

    it('should call onDrop on drop event', () => {
        const event = new DragEvent('drop');
        component.onDrop(event, mockClickIndex2, mockClickIndex2);
        expect(mouseHandlerServiceSpy.onDrop).toHaveBeenCalledWith(event, mockClickIndex2, mockClickIndex2);
    });

    it('should call onMouseUp', () => {
        component.onMouseUp();
        expect(mouseHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseOver on mouse over event', () => {
        const event = new MouseEvent('mouseover');
        component.onMouseOver(event, mockClickIndex3, mockClickIndex3);
        expect(mouseHandlerServiceSpy.onMouseOver).toHaveBeenCalledWith(event, mockClickIndex3, mockClickIndex3);
    });

    it('should call onDragStart on drag start event', () => {
        const event = new DragEvent('dragstart');
        component.onDragStart(event, mockClickIndex4, mockClickIndex4);
        expect(mouseHandlerServiceSpy.onDragStart).toHaveBeenCalledWith(event, mockClickIndex4, mockClickIndex4);
    });

    it('should call onDragEnd on drag end event', () => {
        const event = new DragEvent('dragend');
        component.onDragEnd(event);
        expect(mouseHandlerServiceSpy.onDragEnd).toHaveBeenCalledWith(event);
    });

    it('should call preventDefault on right-click in preventRightClick', () => {
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');

        component.preventRightClick(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault in onDragOver', () => {
        const dragEvent = new DragEvent('dragover');
        spyOn(dragEvent, 'preventDefault');

        component.onDragOver(dragEvent);

        expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call fullClickOnItem on full click event', () => {
        const event = new MouseEvent('click');

        component.fullClickOnItem(event, mockClickIndex2, mockClickIndex3);

        expect(mouseHandlerServiceSpy.fullClickOnItem).toHaveBeenCalledWith(event, mockClickIndex2, mockClickIndex3);
    });
});
