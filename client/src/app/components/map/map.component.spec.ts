import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderingService } from '@app/services/rendering-services/rendering.service';
import { MapComponent } from './map.component';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let renderingServiceSpy: jasmine.SpyObj<RenderingService>;
    let mapStateSpy: jasmine.SpyObj<MapRenderingStateService>;

    beforeEach(async () => {
        renderingServiceSpy = jasmine.createSpyObj('RenderingService', ['initialize', 'stopRendering']);
        mapStateSpy = jasmine.createSpyObj('MapRenderingStateService', [], {
            map: { size: 10 },
        });

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [
                { provide: RenderingService, useValue: renderingServiceSpy },
                { provide: MapRenderingStateService, useValue: mapStateSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize renderingService after view init', () => {
        component.ngAfterViewInit();
        expect(renderingServiceSpy.initialize).toHaveBeenCalled();
    });

    it('should stop the rendering loop on destroy', () => {
        component.ngOnDestroy();
        expect(renderingServiceSpy.stopRendering).toHaveBeenCalled();
    });

    it('should return the mouse location in canvas space when there is a mouse event', () => {
        spyOn(component, 'convertToTilePosition');
        const locationMock = { x: 100, y: 100 };
        const boundingRect = component.mapCanvas.nativeElement.getBoundingClientRect();
        const eventMock = new MouseEvent('click', { clientX: locationMock.x, clientY: locationMock.y });
        component.getMouseLocation(eventMock);
        expect(component.convertToTilePosition).toHaveBeenCalledWith({
            x: Math.max(0, Math.min(Math.round(((locationMock.x - boundingRect.x) / boundingRect.width) * MAP_PIXEL_DIMENSION), MAP_PIXEL_DIMENSION)),
            y: Math.max(0, Math.min(Math.round(((locationMock.y - boundingRect.y) / boundingRect.height) * MAP_PIXEL_DIMENSION), MAP_PIXEL_DIMENSION)),
        });
    });

    it('should emit a click event on mouse click event', () => {
        spyOn(component.clickEvent, 'emit');
        const eventMock = new MouseEvent('click');
        const canvasElement = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        canvasElement.dispatchEvent(eventMock);
        fixture.detectChanges();
        expect(component.clickEvent.emit).toHaveBeenCalled();
    });

    it('should emit an over event on mouse over event', () => {
        spyOn(component.overEvent, 'emit');
        const eventMock = new MouseEvent('mouseover');
        const canvasElement = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        canvasElement.dispatchEvent(eventMock);
        expect(component.overEvent.emit).toHaveBeenCalled();
    });
});
