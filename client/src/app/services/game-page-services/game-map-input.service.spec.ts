import { TestBed } from '@angular/core/testing';

import { GameMapInputService } from './game-map-input.service';

describe('GameMapInputService', () => {
    let service: GameMapInputService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameMapInputService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // TODO test for the mouseclickposition
    // it('should return the mouse location in canvas space when there is a mouse event', () => {
    //     spyOn(component, 'convertToTilePosition');
    //     const locationMock = { x: 100, y: 100 };
    //     const boundingRect = component.mapCanvas.nativeElement.getBoundingClientRect();
    //     const eventMock = new MouseEvent('click', { clientX: locationMock.x, clientY: locationMock.y });
    //     component.getMouseLocation(eventMock);
    //     expect(component.convertToTilePosition).toHaveBeenCalledWith({
    //         x: Math.max(0, Math.min(Math.round(((locationMock.x - boundingRect.x) / boundingRect.width) * MAP_PIXEL_DIMENSION), MAP_PIXEL_DIMENSION)),
    //         y: Math.max(
    //             0,
    //             Math.min(Math.round(((locationMock.y - boundingRect.y) / boundingRect.height) * MAP_PIXEL_DIMENSION), MAP_PIXEL_DIMENSION),
    //         ),
    //     });
    // });
});
