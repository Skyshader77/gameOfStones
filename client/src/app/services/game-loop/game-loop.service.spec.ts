import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FRAME_LENGTH } from '@app/constants/rendering.constants';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { GameLoopService } from './game-loop.service';

describe('GameLoopService', () => {
    let service: GameLoopService;
    let renderingService: jasmine.SpyObj<RenderingService>;
    let movementService: jasmine.SpyObj<MovementService>;

    beforeEach(() => {
        renderingService = jasmine.createSpyObj('RenderingService', ['renderAll']);
        movementService = jasmine.createSpyObj('MovementService', ['update']);

        TestBed.configureTestingModule({
            providers: [
                GameLoopService,
                { provide: RenderingService, useValue: renderingService },
                { provide: MovementService, useValue: movementService },
            ],
        });

        service = TestBed.inject(GameLoopService);
    });

    afterEach(() => {
        service.stopGameLoop();
    });

    describe('stopGameLoop', () => {
        it('should stop the game loop from updating', fakeAsync(() => {
            service.startGameLoop();
            tick(FRAME_LENGTH);
            service.stopGameLoop();
            tick(FRAME_LENGTH);
            expect(movementService.update).toHaveBeenCalledTimes(1);
            expect(renderingService.renderAll).toHaveBeenCalledTimes(1);
        }));
    });
});
