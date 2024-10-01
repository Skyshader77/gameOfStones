import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Routes, provideRouter } from '@angular/router';
import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';
import { Item } from '@app/interfaces/map';
import { MockActivatedRoute } from '@app/interfaces/mock-activated-route';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';
import { of } from 'rxjs';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('MapComponent', () => {
    let component: MapComponent;
    let mouseHandlerServiceSpy: SpyObj<MouseHandlerService>;
    let route: MockActivatedRoute;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let fixture: ComponentFixture<MapComponent>;
    beforeEach(async () => {
        mouseHandlerServiceSpy = jasmine.createSpyObj(
            'MouseHandlerService',
            [
                'onMouseDownEmptyTile',
                'onMouseDownItem',
                'onDrop',
                'onMouseUp',
                'onMouseOver',
                'onDragStart',
                'onDragEnd',
                'fullClickOnItem',
                'initializeMap',
            ],
            {},
        );

        route = {
            snapshot: {
                paramMap: jasmine.createSpyObj('paramMap', ['get']),
            },
            queryParams: of({ size: '10', mode: '1' }),
        };

        TestBed.overrideProvider(ActivatedRoute, { useValue: route });
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['getMapSize', 'initializeMap', 'fetchMap'], {
            currentMap: JSON.parse(JSON.stringify(testConsts.mockNewMap)),
            mapLoaded: new EventEmitter(),
        });
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

    it('should call initializeMap on initialization if mapId is not present and should set tile size', () => {
        spyOn(component, 'setTileSize');
        component.ngOnInit();

        expect(mapManagerServiceSpy.initializeMap).toHaveBeenCalledWith(testConsts.mockSmallMapSize, testConsts.mockCTFGameMode);
        expect(component.setTileSize).toHaveBeenCalled();
    });

    it('should call fetchMap with mapId when mapId is present and should set tile size', () => {
        spyOn(component, 'setTileSize');
        const mapId = '12345';
        (route.snapshot.paramMap.get as jasmine.Spy).and.returnValue(mapId);

        component.ngOnInit();
        mapManagerServiceSpy.mapLoaded.emit();
        expect(mapManagerServiceSpy.fetchMap).toHaveBeenCalledWith(mapId);
        expect(component.setTileSize).toHaveBeenCalled();
    });

    it('should set the correct tileSize based on window height and map size', () => {
        const mockWindowHeight = 900;
        const mockWindowWidth = 1500;
        const expectedTileSize =
            Math.min(mockWindowHeight * consts.MAP_CONTAINER_HEIGHT_FACTOR, mockWindowWidth * consts.MAP_CONTAINER_WIDTH_FACTOR) /
            testConsts.mockSmallMapSize;

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: mockWindowHeight,
        });

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: mockWindowWidth,
        });

        mapManagerServiceSpy.getMapSize.and.returnValue(testConsts.mockSmallMapSize);

        component.setTileSize();

        expect(component.tileSize).toBe(expectedTileSize);
        expect(mapManagerServiceSpy.getMapSize).toHaveBeenCalled();
    });

    it('should call setTileSize on window resize', () => {
        spyOn(component, 'setTileSize');
        window.dispatchEvent(new Event('resize'));
        expect(component.setTileSize).toHaveBeenCalled();
    });

    it('should call onMouseDownEmptyTile on mouse down', () => {
        const event = new MouseEvent('mousedown');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition0.y * testConsts.mockNewMap.size + testConsts.mockClickPosition0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownEmptyTile).toHaveBeenCalledWith(event, testConsts.mockClickPosition0);
    });

    it('should call onMouseDownItem on mouse down on an item', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.mockClickPosition1.y][testConsts.mockClickPosition1.x].item = Item.BOOST4;
        fixture.detectChanges();

        const event = new MouseEvent('mousedown');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = testConsts.mockClickPosition1.y * testConsts.mockNewMap.size + testConsts.mockClickPosition1.x;
        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownItem).toHaveBeenCalledWith(event, testConsts.mockClickPosition1);
    });

    it('should call onDrop on drop event', () => {
        const event = new DragEvent('drop');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = testConsts.mockClickPosition2.y * testConsts.mockNewMap.size + testConsts.mockClickPosition2.x;
        const targetTileDiv = tileDivs[tileIndex];

        targetTileDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.onDrop).toHaveBeenCalledWith(event, testConsts.mockClickPosition2);
    });

    it('should call onMouseUp', () => {
        const event = new MouseEvent('mouseup');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition0.y * testConsts.mockNewMap.size + testConsts.mockClickPosition0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseOver on mouse over event', () => {
        const event = new MouseEvent('mouseover');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition3.y * testConsts.mockNewMap.size + testConsts.mockClickPosition3.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseOver).toHaveBeenCalledWith(event, testConsts.mockClickPosition3);
    });

    it('should call onDragStart on drag start event', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.mockClickPosition4.y][testConsts.mockClickPosition4.x].item = Item.BOOST4;
        fixture.detectChanges();
        const event = new DragEvent('dragstart');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition4.y * testConsts.mockNewMap.size + testConsts.mockClickPosition4.x;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onDragStart).toHaveBeenCalledWith(event, testConsts.mockClickPosition4);
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
        const tileIndex = testConsts.mockClickPosition0.y * testConsts.mockNewMap.size + testConsts.mockClickPosition0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault in onDragOver', () => {
        const dragEvent = new DragEvent('dragover');
        spyOn(dragEvent, 'preventDefault');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition4.y * testConsts.mockNewMap.size + testConsts.mockClickPosition4.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(dragEvent);

        expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call fullClickOnItem on full click event', () => {
        mapManagerServiceSpy.currentMap.mapArray[testConsts.mockClickPosition5.y][testConsts.mockClickPosition5.x].item = Item.BOOST4;
        fixture.detectChanges();
        const event = new MouseEvent('click');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.mockClickPosition5.y * testConsts.mockNewMap.size + testConsts.mockClickPosition5.x;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.fullClickOnItem).toHaveBeenCalledWith(event, testConsts.mockClickPosition5);
    });
});
