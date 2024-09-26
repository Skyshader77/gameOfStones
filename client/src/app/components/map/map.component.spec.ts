import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { RenderingService } from '@app/services/rendering.service';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let renderingServiceSpy: jasmine.SpyObj<RenderingService>;

    beforeEach(async () => {
        renderingServiceSpy = jasmine.createSpyObj('RenderingService', ['initialize', 'stopRendering']);

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [{ provide: RenderingService, useValue: renderingServiceSpy }],
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
        const locationMock = { x: 100, y: 100 };
        const boundingRect = component.mapCanvas.nativeElement.getBoundingClientRect();
        const eventMock = new MouseEvent('click', { clientX: locationMock.x, clientY: locationMock.y });
        const location = component.getMouseLocation(eventMock);
        expect(location).toEqual({ x: locationMock.x - boundingRect.x, y: locationMock.y - boundingRect.y });
    });

    it('should emit a click event on mouse click event', () => {
        spyOn(component.clickEvent, 'emit');
        const eventMock = new MouseEvent('click');
        const canvasElement = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        canvasElement.dispatchEvent(eventMock);
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
