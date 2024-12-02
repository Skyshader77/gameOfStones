import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FRAME_LENGTH } from '@app/constants/rendering.constants';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { FightRenderingService } from '../rendering-services/fight-rendering/fight-rendering.service';
import { RenderingStateService } from '../states/rendering-state/rendering-state.service';
import { GameLoopService } from './game-loop.service';

describe('GameLoopService', () => {
    let service: GameLoopService;
    let renderingService: jasmine.SpyObj<RenderingService>;
    let movementService: jasmine.SpyObj<MovementService>;
    let renderingStateService: jasmine.SpyObj<RenderingStateService>;
    let fightRenderingService: jasmine.SpyObj<FightRenderingService>;

    beforeEach(() => {
        renderingService = jasmine.createSpyObj('RenderingService', ['renderAll']);
        movementService = jasmine.createSpyObj('MovementService', ['update']);
        renderingStateService = jasmine.createSpyObj('RenderingStateService', ['get fightStarted']);
        fightRenderingService = jasmine.createSpyObj('FightRenderingService', ['renderFight']);

        TestBed.configureTestingModule({
            providers: [
                GameLoopService,
                { provide: RenderingService, useValue: renderingService },
                { provide: MovementService, useValue: movementService },
                { provide: RenderingStateService, useValue: renderingStateService },
                { provide: FightRenderingService, useValue: fightRenderingService },
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

    describe('startGameLoop', () => {
        it('should call renderFight when fightStarted is true', fakeAsync(() => {
            renderingStateService.fightStarted = true;

            service.startGameLoop();
            tick(FRAME_LENGTH);

            expect(fightRenderingService.renderFight).toHaveBeenCalled();
            expect(movementService.update).not.toHaveBeenCalled();
            expect(renderingService.renderAll).not.toHaveBeenCalled();

            service.stopGameLoop();
            tick(FRAME_LENGTH);
        }));
    });
});
