import { TestBed } from '@angular/core/testing';

import { RenderingStateService } from './rendering-state.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { of } from 'rxjs';
import { MOCK_REACHABLE_TILE } from '@app/constants/tests.constants';

describe('RenderingStateService', () => {
    let service: RenderingStateService;
    let gameSocketSpy: jasmine.SpyObj<GameLogicSocketService>;

    beforeEach(() => {
        gameSocketSpy = jasmine.createSpyObj('GameLogicSocketService', ['listenToPossiblePlayerMovement']);
        TestBed.configureTestingModule({ providers: [{ provide: GameLogicSocketService, useValue: gameSocketSpy }] });
        service = TestBed.inject(RenderingStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should subscribe on initialize', () => {
        gameSocketSpy.listenToPossiblePlayerMovement.and.returnValue(of([MOCK_REACHABLE_TILE]));
        service.initialize();
        expect(service['possibleMovementListener']).not.toBeUndefined();
    });

    it('should clean up on cleanup', () => {
        service['possibleMovementListener'] = of([MOCK_REACHABLE_TILE]).subscribe();
        const unsubSpy = spyOn<any>(service['possibleMovementListener'], 'unsubscribe');
        service.cleanup();
        expect(unsubSpy).toHaveBeenCalled();
    });
});
