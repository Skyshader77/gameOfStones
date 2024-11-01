import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderingService } from '@app/services/rendering-services/rendering.service';
import { MapComponent } from './map.component';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let gameLoopSpy: jasmine.SpyObj<GameLoopService>;
    let renderingServiceSpy: jasmine.SpyObj<RenderingService>;
    let mapStateSpy: jasmine.SpyObj<MapRenderingStateService>;

    beforeEach(async () => {
        gameLoopSpy = jasmine.createSpyObj('GameLoopService', ['startGameLoop', 'stopGameLoop']);
        renderingServiceSpy = jasmine.createSpyObj('RenderingService', ['setContext']);
        mapStateSpy = jasmine.createSpyObj('MapRenderingStateService', [], {
            map: { size: 10 },
        });

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [
                { provide: GameLoopService, useValue: gameLoopSpy },
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
        expect(renderingServiceSpy.setContext).toHaveBeenCalled();
    });

    it('should stop the game loop on destroy', () => {
        component.ngOnDestroy();
        expect(gameLoopSpy.stopGameLoop).toHaveBeenCalled();
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
