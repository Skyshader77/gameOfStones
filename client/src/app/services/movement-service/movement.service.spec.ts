import { TestBed } from '@angular/core/testing';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { MOCK_HAMMER_PAYLOAD, MOCK_MAPS, MOCK_PLAYERS, MOCK_REACHABLE_TILE, MOCK_TILE_DIMENSION } from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { AudioService } from '@app/services/audio/audio.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { HammerPayload } from '@common/interfaces/item';
import { Direction, MovementServiceOutput } from '@common/interfaces/move';
import { DeadPlayerPayload } from '@common/interfaces/player';
import { of } from 'rxjs';
import { RenderingStateService } from '../states/rendering-state/rendering-state.service';
import { MovementService } from './movement.service';

describe('MovementService', () => {
    let service: MovementService;
    let gameMapServiceMock: jasmine.SpyObj<GameMapService>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;
    let gameLogicSocketServiceMock: jasmine.SpyObj<GameLogicSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let itemManagerServiceMock: jasmine.SpyObj<ItemManagerService>;
    let audioService: jasmine.SpyObj<AudioService>;
    let rendererStateService: jasmine.SpyObj<RenderingStateService>;

    beforeEach(() => {
        gameMapServiceMock = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        audioService = jasmine.createSpyObj('AudioService', ['playSfx']);
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'isCurrentPlayerAI', 'getPlayerByName']);
        gameLogicSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', [
            'listenToPlayerMove',
            'endAction',
            'listenToHammerUsed',
            'listenToPlayerSlip',
        ]);
        rendererStateService = jasmine.createSpyObj('RenderingStateService', ['findHammerTiles']);
        gameLogicSocketServiceMock.listenToPlayerSlip.and.returnValue(of(true));
        myPlayerService = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['getHasToDropItem'], { getHasToDropItem: null });
        gameMapServiceMock.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        gameLogicSocketServiceMock.listenToPlayerMove.and.returnValue(
            of({
                optimalPath: MOCK_REACHABLE_TILE,
            } as MovementServiceOutput),
        );
        gameLogicSocketServiceMock.listenToPlayerSlip.and.returnValue(of(true));
        gameLogicSocketServiceMock.listenToHammerUsed.and.returnValue(
            of({
                hammeredName: MOCK_HAMMER_PAYLOAD.hammeredName,
                movementTiles: MOCK_HAMMER_PAYLOAD.movementTiles,
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
                { provide: AudioService, useValue: audioService },
                { provide: RenderingStateService, useValue: rendererStateService },
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

    it('should update the position of players based on the deadPlayers data', () => {
        const deadPlayers: DeadPlayerPayload[] = [
            {
                player: { playerInfo: { userName: 'Player1' } } as Player,
                respawnPosition: { x: 3, y: 3 },
            },
            {
                player: { playerInfo: { userName: 'Player2' } } as Player,
                respawnPosition: { x: 5, y: 5 },
            },
        ];
        playerListServiceMock.playerList = [
            { playerInfo: { userName: 'Player1' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
            { playerInfo: { userName: 'Player2' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
        ];

        rendererStateService.deadPlayers = deadPlayers;

        service.deadPlayers();
        expect(playerListServiceMock.playerList[0].playerInGame.currentPosition).toEqual({ x: 3, y: 3 });
        expect(playerListServiceMock.playerList[1].playerInGame.currentPosition).toEqual({ x: 5, y: 5 });
    });

    it('should not update any positions if deadPlayers is empty or null', () => {
        const initialPlayerList = [
            { playerInfo: { userName: 'Player1' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
            { playerInfo: { userName: 'Player2' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
        ];

        rendererStateService.deadPlayers = [];
        playerListServiceMock.playerList = [...initialPlayerList];
        service.deadPlayers();
        expect(playerListServiceMock.playerList).toEqual(initialPlayerList);

        rendererStateService.deadPlayers = null as unknown as DeadPlayerPayload[];
        service.deadPlayers();
        expect(playerListServiceMock.playerList).toEqual(initialPlayerList);
    });
});
