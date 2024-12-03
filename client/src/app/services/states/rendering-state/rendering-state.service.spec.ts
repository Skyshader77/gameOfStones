import { TestBed } from '@angular/core/testing';
import { RenderingStateService } from './rendering-state.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import {
    BOTTOM_FINAL,
    INITIAL_BOTTOM,
    INITIAL_LEFT,
    INITIAL_RIGHT,
    INITIAL_TOP,
    INITIAL_X_SQUARE,
    INITIAL_Y_SQUARE,
    LEFT_FINAL,
    RIGHT_FINAL,
    X_SQUARE_FINAL,
    X_SQUARE_LIMIT,
    X_SQUARE_MAX,
    Y_SQUARE_FINAL,
    Y_SQUARE_LIMIT,
    Y_SQUARE_MIN,
} from '@app/constants/rendering-tests.constants';
import { Direction } from '@common/interfaces/move';

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

    it('should update rendering state during fight transition and change direction when limits are reached', () => {
        service.isInFightTransition = false;
        service.fightStarted = true;
        service.squarePos = { x: INITIAL_X_SQUARE, y: INITIAL_Y_SQUARE };
        service['left'] = INITIAL_LEFT;
        service['top'] = INITIAL_TOP;
        service['right'] = INITIAL_RIGHT;
        service['bottom'] = INITIAL_BOTTOM;

        service['direction'] = Direction.LEFT;

        service.squarePos.x = X_SQUARE_LIMIT;
        service.updateFightTransition();
        expect(service.squarePos.x).toBe(INITIAL_LEFT);
        expect(service['top']).toBe(Y_SQUARE_FINAL);
        expect(service['direction']).toBe(Direction.DOWN);

        service.squarePos.x = Y_SQUARE_LIMIT;
        service.updateFightTransition();
        expect(service.squarePos.y).toBe(X_SQUARE_FINAL);
        expect(service['left']).toBe(LEFT_FINAL);
        expect(service['direction']).toBe(Direction.RIGHT);

        service.squarePos.x = X_SQUARE_MAX;
        service.updateFightTransition();
        expect(service.squarePos.x).toBe(X_SQUARE_FINAL);
        expect(service['bottom']).toBe(BOTTOM_FINAL);
        expect(service['direction']).toBe(Direction.UP);

        service.squarePos.y = Y_SQUARE_MIN;
        service.updateFightTransition();
        expect(service.squarePos.y).toBe(Y_SQUARE_FINAL);
        expect(service['right']).toBe(RIGHT_FINAL);
        expect(service['direction']).toBe(Direction.LEFT);

        service['left'] = 1200;
        service.updateFightTransition();
        expect(service.isInFightTransition).toBeFalse();
        expect(service.fightStarted).toBeTrue();
    });
});
