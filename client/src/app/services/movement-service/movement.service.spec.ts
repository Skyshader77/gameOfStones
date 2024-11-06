import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MovementService } from './movement.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayerMove } from '@app/interfaces/player-move';
import { Direction, MovementServiceOutput } from '@common/interfaces/move';
import { MOCK_MAPS, MOCK_PLAYERS, MOCK_REACHABLE_TILE, MOCK_TILE_DIMENSION } from '@app/constants/tests.constants';
import { IDLE_FRAMES, MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { MyPlayerService } from '../room-services/my-player.service';

describe('MovementService', () => {
    let service: MovementService;
    let gameMapServiceMock: jasmine.SpyObj<GameMapService>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;
    let gameLogicSocketServiceMock: jasmine.SpyObj<GameLogicSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        gameMapServiceMock = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        gameLogicSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', ['listenToPlayerMove', 'endAction']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        gameMapServiceMock.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        gameLogicSocketServiceMock.listenToPlayerMove.and.returnValue(
            of({
                optimalPath: MOCK_REACHABLE_TILE,
            } as MovementServiceOutput),
        );

        TestBed.configureTestingModule({
            providers: [
                MovementService,
                { provide: GameMapService, useValue: gameMapServiceMock },
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: GameLogicSocketService, useValue: gameLogicSocketServiceMock },
                { provide: MyPlayerService, useValue: myPlayerService },
            ],
        });

        service = TestBed.inject(MovementService);
    });

    it('should initialize and subscribe to player moves', () => {
        const currentPlayerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayerMock);

        service.initialize();

        expect(gameLogicSocketServiceMock.listenToPlayerMove).toHaveBeenCalled();
        expect(service.isMoving()).toBeTrue();
    });

    it('should add new player moves', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));

        service.addNewPlayerMove(playerMock, Direction.UP);

        expect(service.isMoving()).toBeTrue();
    });

    it('should update and process player moves', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        service.addNewPlayerMove(playerMock, Direction.UP);

        service.update();

        expect(playerMock.renderInfo.currentSprite).toBeDefined();
        expect(service.isMoving()).toBeTrue();
    });

    it('should execute small player movement when frame is not multiple of MOVEMENT_FRAMES', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerMock.playerInGame.remainingMovement = 100;
        const playerMove: PlayerMove = { player: playerMock, direction: Direction.UP };
        service['frame'] = 1;

        service.movePlayer(playerMove);

        expect(Math.abs(playerMock.renderInfo.offset.x)).toEqual(0);
        expect(playerMock.renderInfo.offset.y).toBeLessThan(0);
    });

    it('should execute big player movement when frame is multiple of MOVEMENT_FRAMES', () => {
        service['frame'] = MOVEMENT_FRAMES;
        service['timeout'] = IDLE_FRAMES;
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, direction: Direction.DOWN };

        service.movePlayer(playerMove);

        expect(playerMock.renderInfo.offset.x).toBe(MOCK_PLAYERS[0].renderInfo.offset.x);
        expect(playerMock.renderInfo.offset.y).toBe(MOCK_PLAYERS[0].renderInfo.offset.y);
        expect(playerMock.playerInGame.currentPosition.y).toBe(1);
        expect(playerMock.playerInGame.remainingMovement).toBeLessThan(MOCK_PLAYERS[0].playerInGame.remainingMovement);
    });

    it('should increment timeout if frame is a multiple of MOVEMENT_FRAMES and timeout is not a multiple of IDLE_FRAME ', () => {
        service['frame'] = MOVEMENT_FRAMES;
        service['timeout'] = 1;
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, direction: Direction.DOWN };

        service.movePlayer(playerMove);

        expect(service['timeout']).toBe(2);
    });

    it('should clean up the subscription on cleanup', () => {
        service.initialize();

        const unsubscribeSpy = spyOn(service['movementSubscription'], 'unsubscribe');

        service.cleanup();

        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should end the action when queue is empty', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, direction: Direction.DOWN };
        service['frame'] = MOVEMENT_FRAMES;
        service['timeout'] = IDLE_FRAMES;
        service.movePlayer(playerMove);

        expect(gameLogicSocketServiceMock.endAction).toHaveBeenCalled();
    });

    it('should not end the action when queue is empty and is not current player', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, direction: Direction.DOWN };
        service['frame'] = MOVEMENT_FRAMES;
        service['timeout'] = IDLE_FRAMES;
        Object.defineProperty(myPlayerService, 'isCurrentPlayer', { value: false });
        service.movePlayer(playerMove);

        expect(gameLogicSocketServiceMock.endAction).not.toHaveBeenCalled();
    });

    it('should handle empty movement queue', () => {
        service.update();
        expect(gameLogicSocketServiceMock.endAction).not.toHaveBeenCalled();
    });
});
