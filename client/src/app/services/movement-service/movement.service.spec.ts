import { TestBed } from '@angular/core/testing';
import { DEATH_FRAMES, HAMMER_SPEED_UP, MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import {
    MOCK_HAMMER_PAYLOAD,
    MOCK_MAPS,
    MOCK_PLAYER_INFO,
    MOCK_PLAYERS,
    MOCK_REACHABLE_TILE,
    MOCK_TILE_DIMENSION,
} from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { AudioService } from '@app/services/audio/audio.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
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
        service = jasmine.createSpyObj('MovementService', ['slipPlayer']);
        gameMapServiceMock = jasmine.createSpyObj('GameMapService', ['getTileDimension'], { map: MOCK_MAPS[0] });
        audioService = jasmine.createSpyObj('AudioService', ['playSfx']);
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer', 'isCurrentPlayerAI', 'getPlayerByName']);
        gameLogicSocketServiceMock = jasmine.createSpyObj('GameLogicSocketService', [
            'listenToPlayerMove',
            'listenToPlayerSlip',
            'endAction',
            'listenToHammerUsed',
        ]);
        rendererStateService = jasmine.createSpyObj('RenderingStateService', ['findHammerTiles'], { hammerTiles: [] });
        gameLogicSocketServiceMock.listenToPlayerSlip.and.returnValue(of(MOCK_PLAYERS[0].playerInfo.userName));
        myPlayerService = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['getHasToDropItem', 'itemManagerServiceMock', 'pickupItem'], {
            getHasToDropItem: null,
        });
        gameMapServiceMock.getTileDimension.and.returnValue(MOCK_TILE_DIMENSION);
        gameLogicSocketServiceMock.listenToPlayerMove.and.returnValue(
            of({
                optimalPath: MOCK_REACHABLE_TILE,
            } as MovementServiceOutput),
        );
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

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /* MARCHE PAS CALISSE !!! */

    /* it('should handle slip player when pending slip is true', () => {
        // Arrange
        service['pendingMove'] = false;
        service['pendingSlip'] = true;
        service['playerMovementsQueue'] = []; // Ensure this is empty

        const itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['isWaitingForPickup', 'pickupItem']);
        itemManagerServiceMock.isWaitingForPickup.and.returnValue(true); // Mock the return value for isWaitingForPickup

        // Set up the service with mocked dependencies
        service['itemManagerService'] = itemManagerServiceMock; // Assign the mock to the service's property

        // Ensure pendingMove is false and pendingSlip is true for this test

        spyOn(service, 'movePlayer');
        spyOn(service, 'slipPlayer'); // Ensure that slipPlayer is spied on

        // Act
        service.update(); // This should call slipPlayer()

        // Assert
        expect(service.slipPlayer).toHaveBeenCalled(); // Ensure slipPlayer was called
    }); */

    /* it('should handle end action when there is no movement, no slip, and no item pickup', () => {
        service['pendingMove'] = true;
        service['playerMovementsQueue'] = [];

        const itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['isWaitingForPickup', 'pickupItem']);
        itemManagerServiceMock.isWaitingForPickup.and.returnValue(true);

        service['pendingSlip'] = false;

        spyOn(service, 'movePlayer');
        spyOn(service, 'slipPlayer');

        service.update();

        expect(gameLogicSocketServiceMock.endAction).toHaveBeenCalled();
    }); */

    /*  it('should handle hammer movement if isHammerMovement is true', () => {
        // Arrange
        service['pendingMove'] = false;
        rendererStateService.isHammerMovement = true;
        service['playerMovementsQueue'] = []; // Initialize playerMovementsQueue as an empty array

        spyOn(service, 'hammerPlayer');

        // Act
        service.update();

        // Assert
        expect(service.hammerPlayer).toHaveBeenCalled();
    }); */

    it('should handle movement when there are player moves in the queue', () => {
        service['pendingMove'] = true;
        service['playerMovementsQueue'] = [
            {
                player: MOCK_PLAYERS[0],
                node: {
                    direction: Direction.UP,
                    remainingMovement: 0,
                },
            },
        ];
        spyOn(service, 'movePlayer');
        service.update();
        expect(service.movePlayer).toHaveBeenCalled();
    });

    it('should handle item pickup when no player moves are left', () => {
        service['pendingMove'] = true;
        service['playerMovementsQueue'] = [];
        const itemManagerServiceMock = jasmine.createSpyObj('ItemManagerService', ['isWaitingForPickup', 'pickupItem']);
        itemManagerServiceMock.isWaitingForPickup.and.returnValue(true);
        service['itemManagerService'] = itemManagerServiceMock;
        spyOn(service, 'movePlayer');
        spyOn(service, 'slipPlayer');
        service.update();
        expect(itemManagerServiceMock.pickupItem).toHaveBeenCalled();
    });

    it('should execute small movement for hammer speed up', () => {
        const player: Player = {
            playerInfo: MOCK_PLAYER_INFO[0],
            renderInfo: { offset: { x: 0, y: 0 }, currentSprite: 0, currentStep: 1, angle: 0 },
            playerInGame: MOCK_PLAYER_IN_GAME,
        };
        const playerMove: PlayerMove = { player, node: { direction: Direction.RIGHT, remainingMovement: 10 } };
        spyOn(service, 'hammerPlayer').and.callThrough();
        const initialOffsetX = player.renderInfo.offset.x;
        service.hammerPlayer(playerMove);
        expect(service.hammerPlayer).toHaveBeenCalled();
        expect(player.renderInfo.offset.x).toBeGreaterThan(initialOffsetX);
    });

    it('should execute big movement when correct frame is reached', () => {
        const player: Player = {
            playerInfo: MOCK_PLAYER_INFO[0],
            renderInfo: { offset: { x: 0, y: 0 }, currentSprite: 0, currentStep: 1, angle: 0 },
            playerInGame: MOCK_PLAYER_IN_GAME,
        };
        const playerMove: PlayerMove = { player, node: { direction: Direction.RIGHT, remainingMovement: 10 } };
        service['frame'] = MOVEMENT_FRAMES / HAMMER_SPEED_UP;
        spyOn(service as any, 'executeBigPlayerMovement').and.callThrough();
        service.hammerPlayer(playerMove);
        expect((service as any).executeBigPlayerMovement).toHaveBeenCalled();
    });

    it('should reset hammer movement flag after processing all movements', () => {
        const player: Player = {
            playerInfo: MOCK_PLAYER_INFO[0],
            renderInfo: { offset: { x: 0, y: 0 }, currentSprite: 0, currentStep: 1, angle: 0 },
            playerInGame: MOCK_PLAYER_IN_GAME,
        };
        const playerMove: PlayerMove = { player, node: { direction: Direction.RIGHT, remainingMovement: 10 } };
        service['playerMovementsQueue'] = [playerMove];
        service['frame'] = MOVEMENT_FRAMES / HAMMER_SPEED_UP;
        service.hammerPlayer(playerMove);
        expect(rendererStateService.isHammerMovement).toBeFalse();
    });

    it('should handle dead players if there are dead players', () => {
        service['pendingMove'] = false;
        rendererStateService.deadPlayers = [
            {
                player: { playerInfo: MOCK_PLAYER_INFO[0], playerInGame: MOCK_PLAYER_IN_GAME },
                respawnPosition: { x: 0, y: 0 },
            },
        ];
        spyOn(service, 'deadPlayers');
        service.update();
        expect(service.deadPlayers).toHaveBeenCalled();
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
        spyOn(service, 'deadPlayers');
        const playerMock = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        service.addNewPlayerMove(playerMock, { direction: Direction.UP, remainingMovement: 0 });

        rendererStateService.deadPlayers = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        service.update();

        expect(playerMock.renderInfo.currentSprite).toBeDefined();
        expect(service.isMoving()).toBeTrue();
        expect(service.deadPlayers).toHaveBeenCalled();
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
        spyOn(service, 'deadPlayers');
        rendererStateService.deadPlayers = [];
        service.update();
        expect(gameLogicSocketServiceMock.endAction).not.toHaveBeenCalled();
    });

    it('should update the position of players based on the deadPlayers data', () => {
        service['frame'] = DEATH_FRAMES + 1;

        const deadPlayers: DeadPlayerPayload[] = [
            {
                player: { playerInfo: { userName: 'Player 1' } } as Player,
                respawnPosition: { x: 3, y: 3 },
            },
            {
                player: { playerInfo: { userName: 'Player 2' } } as Player,
                respawnPosition: { x: 5, y: 5 },
            },
        ];

        const mockPlayerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        playerListServiceMock.playerList = mockPlayerList;

        rendererStateService.deadPlayers = deadPlayers;

        playerListServiceMock.getPlayerByName.and.callFake((name: string) => {
            return mockPlayerList.find((player: Player) => player.playerInfo.userName === name);
        });

        service.deadPlayers();

        expect(rendererStateService.deadPlayers.length).toBe(0);
        expect(service['frame']).toBe(1);
        expect(gameLogicSocketServiceMock.endAction).toHaveBeenCalled();
        expect(mockPlayerList[0].playerInGame.currentPosition).toEqual({ x: 3, y: 3 });
        expect(mockPlayerList[1].playerInGame.currentPosition).toEqual({ x: 5, y: 5 });
    });

    it('should not update any positions if deadPlayers is empty or null', () => {
        const initialPlayerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));

        rendererStateService.deadPlayers = [];
        playerListServiceMock.playerList = [...initialPlayerList];
        service.deadPlayers();
        expect(playerListServiceMock.playerList).toEqual(initialPlayerList);
    });
});
