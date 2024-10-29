import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Routes, provideRouter } from '@angular/router';
import * as consts from '@app/constants/edit-page.constants';
import * as testConsts from '@app/constants/tests.constants';
import { MockActivatedRoute } from '@app/interfaces/mock-activated-route';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';
import { of } from 'rxjs';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;
import { ItemType } from '@common/enums/item-type.enum';

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
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['getMapSize', 'getItemType', 'initializeMap', 'fetchMap'], {
            currentMap: JSON.parse(JSON.stringify(testConsts.MOCK_NEW_MAP)),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tileSizeSpy = spyOn<any>(component, 'setTileSize');
        component.ngOnInit();

        expect(mapManagerServiceSpy.initializeMap).toHaveBeenCalledWith(testConsts.MOCK_SMALL_MAP_SIZE, testConsts.MOCK_CTF_GAME_MODE);
        expect(tileSizeSpy).toHaveBeenCalled();
    });

    it('should call fetchMap with mapId when mapId is present and should set tile size', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tileSizeSpy = spyOn<any>(component, 'setTileSize');
        const mapId = '12345';
        (route.snapshot.paramMap.get as jasmine.Spy).and.returnValue(mapId);

        component.ngOnInit();
        mapManagerServiceSpy.mapLoaded.emit();
        expect(mapManagerServiceSpy.fetchMap).toHaveBeenCalledWith(mapId);
        expect(tileSizeSpy).toHaveBeenCalled();
    });

    it('should set the correct tileSize based on window height and map size', () => {
        const mockWindowHeight = 900;
        const mockWindowWidth = 1500;
        const expectedTileSize =
            Math.min(mockWindowHeight * consts.MAP_CONTAINER_HEIGHT_FACTOR, mockWindowWidth * consts.MAP_CONTAINER_WIDTH_FACTOR) /
            testConsts.MOCK_SMALL_MAP_SIZE;

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

        mapManagerServiceSpy.getMapSize.and.returnValue(testConsts.MOCK_SMALL_MAP_SIZE);

        component['setTileSize']();

        expect(component.tileSize).toBe(expectedTileSize);
        expect(mapManagerServiceSpy.getMapSize).toHaveBeenCalled();
    });

    it('should call setTileSize on window resize', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tileSizeSpy = spyOn<any>(component, 'setTileSize');
        window.dispatchEvent(new Event('resize'));
        expect(tileSizeSpy).toHaveBeenCalled();
    });

    it('should call onMouseDownEmptyTile on mouse down', () => {
        const event = new MouseEvent('mousedown');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_0.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownEmptyTile).toHaveBeenCalledWith(event, testConsts.MOCK_CLICK_POSITION_0);
    });

    it('should call onMouseDownItem on mouse down on an item', () => {
        mapManagerServiceSpy.currentMap.placedItems.push({
            position: testConsts.MOCK_CLICK_POSITION_1,
            type: ItemType.BOOST4,
        });
        fixture.detectChanges();

        const event = new MouseEvent('mousedown');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = testConsts.MOCK_CLICK_POSITION_1.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_1.x;
        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseDownItem).toHaveBeenCalledWith(event, testConsts.MOCK_CLICK_POSITION_1);
    });

    it('should call onDrop on drop event', () => {
        const event = new DragEvent('drop');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;

        const tileIndex = testConsts.MOCK_CLICK_POSITION_2.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_2.x;
        const targetTileDiv = tileDivs[tileIndex];

        targetTileDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.onDrop).toHaveBeenCalledWith(event, testConsts.MOCK_CLICK_POSITION_2);
    });

    it('should call onMouseUp', () => {
        const event = new MouseEvent('mouseup');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_0.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMouseOver on mouse over event', () => {
        const event = new MouseEvent('mouseover');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_3.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_3.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onMouseOver).toHaveBeenCalledWith(event, testConsts.MOCK_CLICK_POSITION_3);
    });

    it('should call onDragStart on drag start event', () => {
        mapManagerServiceSpy.currentMap.placedItems.push({
            position: testConsts.MOCK_CLICK_POSITION_4,
            type: ItemType.BOOST4,
        });
        fixture.detectChanges();
        const event = new DragEvent('dragstart');
        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_4.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_4.x;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);
        expect(mouseHandlerServiceSpy.onDragStart).toHaveBeenCalledWith(event, testConsts.MOCK_CLICK_POSITION_4);
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
        const tileIndex = testConsts.MOCK_CLICK_POSITION_0.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_0.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault in onDragOver', () => {
        const dragEvent = new DragEvent('dragover');
        spyOn(dragEvent, 'preventDefault');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_4.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_4.x;

        const targetDiv = tileDivs[tileIndex];

        targetDiv.dispatchEvent(dragEvent);

        expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call fullClickOnItem on full click event', () => {
        mapManagerServiceSpy.currentMap.placedItems.push({
            position: testConsts.MOCK_CLICK_POSITION_5,
            type: ItemType.BOOST4,
        });
        fixture.detectChanges();
        const event = new MouseEvent('click');

        const tileDivs = fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLDivElement>;
        const tileIndex = testConsts.MOCK_CLICK_POSITION_5.y * testConsts.MOCK_NEW_MAP.size + testConsts.MOCK_CLICK_POSITION_5.x;

        const targetTileDiv = tileDivs[tileIndex];

        const targetItemDiv = targetTileDiv.querySelector('.item') as HTMLDivElement;

        targetItemDiv.dispatchEvent(event);

        expect(mouseHandlerServiceSpy.fullClickOnItem).toHaveBeenCalled();
    });
});
