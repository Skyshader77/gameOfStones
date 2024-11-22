import { TestBed } from '@angular/core/testing';
import { RenderingStateService } from './rendering-state.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';

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
});
