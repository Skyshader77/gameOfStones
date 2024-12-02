import { TestBed } from '@angular/core/testing';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { MOCK_HAMMER_PAYLOAD, MOCK_MAPS, MOCK_PLAYERS, MOCK_REACHABLE_TILE, MOCK_TILE_DIMENSION } from '@app/constants/tests.constants';
import { PlayerMove } from '@app/interfaces/player-move';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { HammerPayload } from '@common/interfaces/item';
import { Direction, MovementServiceOutput } from '@common/interfaces/move';
import { of } from 'rxjs';
import { MovementService } from './movement.service';

describe('MovementService', () => {
    let service: MovementService;
    let gameMapServiceMock: jasmine.SpyObj<GameMapService>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;
    let gameLogicSocketServiceMock: jasmine.SpyObj<GameLogicSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let itemManagerServiceMock: jasmine.SpyObj<ItemManagerService>;

    beforeEach(() => {
        gameMapServiceMock = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'isCurrentPlayerAI']);
        gameLogicSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', ['listenToPlayerMove', 'endAction', 'listenToHammerUsed']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['getHasToDropItem'], { getHasToDropItem: null });
        gameMapServiceMock.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        gameLogicSocketServiceMock.listenToPlayerMove.and.returnValue(
            of({
                optimalPath: MOCK_REACHABLE_TILE,
            } as MovementServiceOutput),
        );
        
        gameLogicSocketServiceMock.listenToHammerUsed.and.returnValue(
            of({playerUsedName:MOCK_HAMMER_PAYLOAD.playerUsedName,
                deadPlayers:MOCK_HAMMER_PAYLOAD.deadPlayers,
                affectedTiles:MOCK_HAMMER_PAYLOAD.affectedTiles
            } as HammerPayload),
        );

        TestBed.configureTestingModule({
            providers: [
                MovementService,
                { provide: GameMapService, useValue: gameMapServiceMock },
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: GameLogicSocketService, useValue: gameLogicSocketServiceMock },
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: ItemManagerService, useValue: itemManagerServiceMock },
            ],
        });

        service = TestBed.inject(MovementService);
    });

    it('should initialize and subscribe to player moves', () => {
        const currentPlayerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerListServiceMock.getCurrentPlayer.and.returnValue(currentPlayerMock);

        service.initialize();

        expect(gameLogicSocketServiceMock.listenToPlayerMove).toHaveBeenCalled();
        expect(gameLogicSocketServiceMock.listenToHammerUsed).toHaveBeenCalled();
        expect(service.isMoving()).toBeTrue();
    });

    it('should add new player moves', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));

        service.addNewPlayerMove(playerMock, { direction: Direction.UP, remainingMovement: 0 });

        expect(service.isMoving()).toBeTrue();
    });

    it('should update and process player moves', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        service.addNewPlayerMove(playerMock, { direction: Direction.UP, remainingMovement: 0 });

        service.update();

        expect(playerMock.renderInfo.currentSprite).toBeDefined();
        expect(service.isMoving()).toBeTrue();
    });

    it('should execute small player movement when frame is not multiple of MOVEMENT_FRAMES', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        playerMock.playerInGame.remainingMovement = 100;
        const playerMove: PlayerMove = { player: playerMock, node: { direction: Direction.UP, remainingMovement: 0 } };
        service['frame'] = 1;

        service.movePlayer(playerMove);

        expect(Math.abs(playerMock.renderInfo.offset.x)).toEqual(0);
        expect(playerMock.renderInfo.offset.y).toBeLessThan(0);
    });

    it('should execute big player movement when frame is multiple of MOVEMENT_FRAMES', () => {
        service['frame'] = MOVEMENT_FRAMES;
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, node: { direction: Direction.DOWN, remainingMovement: 0 } };

        service.movePlayer(playerMove);

        expect(playerMock.renderInfo.offset.x).toBe(MOCK_PLAYERS[0].renderInfo.offset.x);
        expect(playerMock.renderInfo.offset.y).toBe(MOCK_PLAYERS[0].renderInfo.offset.y);
        expect(playerMock.playerInGame.currentPosition.y).toBe(1);
        expect(playerMock.playerInGame.remainingMovement).toBeLessThan(MOCK_PLAYERS[0].playerInGame.remainingMovement);
    });

    it('should clean up the subscription on cleanup', () => {
        service.initialize();

        const unsubscribeSpy = spyOn(service['movementSubscription'], 'unsubscribe');
        const unsubscribeHammerSpy = spyOn(service['hammerSubscription'], 'unsubscribe');
        service.cleanup();

        expect(unsubscribeSpy).toHaveBeenCalled();
        expect(unsubscribeHammerSpy).toHaveBeenCalled();
    });

    it('should end the action when queue is empty', () => {
        Object.defineProperty(itemManagerServiceMock, 'getHasToDropItem', {
            get: () => false,
        });

        spyOn(service, 'isMoving').and.returnValue(false);
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, node: { direction: Direction.DOWN, remainingMovement: 0 } };
        service['frame'] = MOVEMENT_FRAMES;
        service.movePlayer(playerMove);

        expect(gameLogicSocketServiceMock.endAction).toHaveBeenCalled();
    });

    it('should not end the action when queue is empty and is not current player', () => {
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerMove: PlayerMove = { player: playerMock, node: { direction: Direction.DOWN, remainingMovement: 0 } };
        service['frame'] = MOVEMENT_FRAMES;
        Object.defineProperty(myPlayerService, 'isCurrentPlayer', { value: false });

        playerListServiceMock.isCurrentPlayerAI.and.returnValue(false);

        service.movePlayer(playerMove);

        expect(gameLogicSocketServiceMock.endAction).not.toHaveBeenCalled();
    });

    it('should handle empty movement queue', () => {
        service.update();
        expect(gameLogicSocketServiceMock.endAction).not.toHaveBeenCalled();
    });
});
