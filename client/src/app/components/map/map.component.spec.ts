import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { RenderingService } from '@app/services/rendering-services/rendering.service';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let gameLoopSpy: jasmine.SpyObj<GameLoopService>;
    let renderingServiceSpy: jasmine.SpyObj<RenderingService>;
    let mapStateSpy: jasmine.SpyObj<MapRenderingStateService>;
    let mockMapInputService: jasmine.SpyObj<GameMapInputService>;

    beforeEach(async () => {
        gameLoopSpy = jasmine.createSpyObj('GameLoopService', ['startGameLoop', 'stopGameLoop']);
        renderingServiceSpy = jasmine.createSpyObj('RenderingService', ['setContext']);
        mockMapInputService = jasmine.createSpyObj('GameMapInputService', ['getMouseLocation', 'getClickType']);
        mapStateSpy = jasmine.createSpyObj('MapRenderingStateService', [], {
            map: { size: 10 },
        });

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [
                { provide: GameLoopService, useValue: gameLoopSpy },
                { provide: RenderingService, useValue: renderingServiceSpy },
                { provide: MapRenderingStateService, useValue: mapStateSpy },
                { provide: GameMapInputService, useValue: mockMapInputService },
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

    it('should prevent default and stop propagation on contextmenu event', () => {
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');

        component.onMouseEvent(component.rightClickEvent, event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });
});
