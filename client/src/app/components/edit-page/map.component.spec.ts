import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('MapComponent', () => {
    const mockMapGrassOnly: CreationMap = {
        name: 'Mock Map 1',
        description: '',
        size: 10,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
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
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex0 * mockMapGrassOnly.size + mockClickIndex0;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownEmptyTile).toHaveBeenCalledWith(event, mockClickIndex0, mockClickIndex0);
    });

    it('should call onMouseDownItem on mouse down on an item', () => {
        mockMapGrassOnly.mapArray[mockClickIndex1][mockClickIndex1].item = Item.BOOST4;
        fixture.detectChanges();

        const event = new MouseEvent('mousedown');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = mockClickIndex1 * mockMapGrassOnly.size + mockClickIndex1;
        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownItem).toHaveBeenCalledWith(event, mockClickIndex1, mockClickIndex1);
    });

    it('should call onDrop on drop event', () => {
        const event = new DragEvent('drop');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = mockClickIndex2 * mockMapGrassOnly.size + mockClickIndex2;
        const targetTileDiv = tileDivs[tileIndex];

        targetTileDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.onDrop).toHaveBeenCalledWith(event, mockClickIndex2, mockClickIndex2);
    });

    it('should call onMouseUp', () => {
        const event = new MouseEvent('mouseup');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex0 * mockMapGrassOnly.size + mockClickIndex0;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseOver on mouse over event', () => {
        const event = new MouseEvent('mouseover');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex3 * mockMapGrassOnly.size + mockClickIndex3;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseOver).toHaveBeenCalledWith(event, mockClickIndex3, mockClickIndex3);
    });

    it('should call onDragStart on drag start event', () => {
        mockMapGrassOnly.mapArray[mockClickIndex4][mockClickIndex4].item = Item.BOOST4;
        fixture.detectChanges();
        const event = new DragEvent('dragstart');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex4 * mockMapGrassOnly.size + mockClickIndex4;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onDragStart).toHaveBeenCalledWith(event, mockClickIndex4, mockClickIndex4);
    });

    it('should call onDragEnd on drag end event', () => {
        const event = new DragEvent('dragend');
        document.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onDragEnd).toHaveBeenCalledWith(event);
    });

    it('should call preventDefault on right-click in preventRightClick', () => {
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex0 * mockMapGrassOnly.size + mockClickIndex0;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault in onDragOver', () => {
        const dragEvent = new DragEvent('dragover');
        spyOn(dragEvent, 'preventDefault');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex4 * mockMapGrassOnly.size + mockClickIndex4;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(dragEvent);

        expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call fullClickOnItem on full click event', () => {
        mockMapGrassOnly.mapArray[mockClickIndex2][mockClickIndex3].item = Item.BOOST4;
        fixture.detectChanges();
        const event = new MouseEvent('click');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = mockClickIndex2 * mockMapGrassOnly.size + mockClickIndex3;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.fullClickOnItem).toHaveBeenCalledWith(event, mockClickIndex2, mockClickIndex3);
    });
});
