import { TestBed } from '@angular/core/testing';
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
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { ItemType } from '@common/enums/item-type.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { Direction } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { RenderingStateService } from './rendering-state.service';

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

    it('should do nothing if affectedTiles is empty', () => {
        const affectedTiles: Vec2[] = [];
        expect(service.hammerTiles.length).toBe(0);
        service.findHammerTiles(affectedTiles);
        expect(service.hammerTiles.length).toBe(0);
    });

    it('should calculate direction and update hammerTiles when affectedTiles is non-empty', () => {
        const affectedTiles: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ];
        expect(service.hammerTiles.length).toBe(0);
        service.findHammerTiles(affectedTiles);
        const expectedDirection: Direction = Direction.RIGHT;
        expect(service.hammerTiles.length).toBe(2);
        expect(service.hammerTiles[0].direction).toBe(expectedDirection);
        expect(service.hammerTiles[0].remainingMovement).toBe(1);
        expect(service.hammerTiles[1].remainingMovement).toBe(0);
    });

    it('should update relevant properties when updateMovement is called', () => {
        service.displayPlayableTiles = true;
        service.displayActions = true;
        service.arrowHead = null;
        service.updateMovement();
        expect(service.displayPlayableTiles).toBeFalse();
        expect(service.displayActions).toBeFalse();
        expect(service.arrowHead).toBeNull();
    });

    it('should update relevant properties when updateUseItem is called', () => {
        service.displayActions = true;
        service.displayItemTiles = true;
        service.currentlySelectedItem = ItemType.GeodeBomb;
        service.showExplosion = false;
        service.updateUseItem();
        expect(service.displayActions).toBeFalse();
        expect(service.displayItemTiles).toBeFalse();
        expect(service.currentlySelectedItem).toBeNull();
        expect(service.showExplosion).toBeTrue();
    });

    it('should reset relevant properties when updateChangeTurn is called', () => {
        service.displayPlayableTiles = true;
        service.displayActions = true;
        service.displayItemTiles = true;
        service.currentlySelectedItem = ItemType.BismuthShield;
        service.updateChangeTurn();
        expect(service.displayPlayableTiles).toBeFalse();
        expect(service.displayActions).toBeFalse();
        expect(service.displayItemTiles).toBeFalse();
        expect(service.currentlySelectedItem).toBeNull();
    });

    it('should return correct direction from vec2', () => {
        const testVec: Vec2 = { x: 1, y: 0 };
        const expectedDirection: Direction = Direction.RIGHT;
        const service = new RenderingStateService();
        const direction = (service as any).getDirectionFromVec2(testVec);
        expect(direction).toBe(expectedDirection);
    });

    it('should return undefined if no matching direction is found', () => {
        const testVec: Vec2 = { x: 99, y: 99 };
        const service = new RenderingStateService();
        const direction = (service as any).getDirectionFromVec2(testVec);
        expect(direction).toBeUndefined();
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

    it('should update turn info', () => {
        const mockCurrentPlayer: Player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const mockTurnInfo: TurnInformation = { attributes: mockCurrentPlayer.playerInGame.attributes } as TurnInformation;
        service.updateTurnInfo(mockTurnInfo);
        expect(service.displayPlayableTiles).toBeTrue();
        expect(service.displayActions).toBeFalse();
        expect(service.displayItemTiles).toBeFalse();
        expect(service.currentlySelectedItem).toBeNull();
    });
});
