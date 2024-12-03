import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_NEW_MAP, MOCK_PLAYERS, MOCK_PLAYER_STARTS } from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { AudioService } from '@app/services/audio/audio.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { START_TURN_DELAY, TURN_DURATION } from '@common/constants/gameplay.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { ItemUsedPayload } from '@common/interfaces/item';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameLogicSocketService } from './game-logic-socket.service';

const NUMB_SUBSCRIPTIONS = 12;

describe('GameLogicSocketService', () => {
    let service: GameLogicSocketService;
    let socketService: jasmine.SpyObj<SocketService>;
    let playerListService: jasmine.SpyObj<PlayerListService>;
    let gameTimeService: jasmine.SpyObj<GameTimeService>;
    let router: jasmine.SpyObj<Router>;
    let gameMapService: jasmine.SpyObj<GameMapService>;
    let audioService: jasmine.SpyObj<AudioService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;

    const mockSocketSubject = new Subject();

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [], { isCurrentPlayer: true });
        const playerListSpy = jasmine.createSpyObj('PlayerListService', [
            'preparePlayersForGameStart',
            'updateCurrentPlayer',
            'getCurrentPlayer',
            'getPlayerByName',
            'isCurrentPlayerAI',
            'handleDeadPlayers',
        ]);
        const gameTimeSpy = jasmine.createSpyObj('GameTimeService', ['setStartTime']);
        audioService = jasmine.createSpyObj('AudioService', ['playSfx']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const gameMapSpy = jasmine.createSpyObj('GameMapService', ['updateDoorState', 'updateItemsAfterPlaced']);
        const renderingStateSpy = jasmine.createSpyObj('RenderingStateService', ['updateChangeTurn', 'updateTurnInfo', 'updateUseBomb'], {
            displayActions: false,
            displayItemTiles: false,
            currentlySelectedItem: null,
            playableTiles: [],
        });
        const itemManagerSpy = jasmine.createSpyObj('ItemManagerService', [
            'handleBombUsed',
            'handleItemLost',
            'handleCloseItemDropModal',
            'handleItemPlaced',
            'handleInventoryFull',
            'handleItemDrop',
            'handleItemPickup',
        ]);

        socketSpy.on.and.returnValue(mockSocketSubject);

        TestBed.configureTestingModule({
            providers: [
                GameLogicSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameTimeService, useValue: gameTimeSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameMapService, useValue: gameMapSpy },
                { provide: RenderingStateService, useValue: renderingStateSpy },
                { provide: ItemManagerService, useValue: itemManagerSpy },
                { provide: AudioService, useValue: audioService },
                { provide: MyPlayerService, useValue: myPlayerSpy },
            ],
        });

        service = TestBed.inject(GameLogicSocketService);
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        playerListService = TestBed.inject(PlayerListService) as jasmine.SpyObj<PlayerListService>;
        gameTimeService = TestBed.inject(GameTimeService) as jasmine.SpyObj<GameTimeService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        gameMapService = TestBed.inject(GameMapService) as jasmine.SpyObj<GameMapService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        beforeEach(() => {
            service.initialize();
        });

        it('should set up subscriptions for turn changes and door events', () => {
            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.ChangeTurn);
            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.StartTurn);
            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.ToggleDoor);
        });
    });

    describe('processMovement', () => {
        it('should emit desired move event with destination', () => {
            const mockDestination = { x: 1, y: 1 };
            service.processMovement(mockDestination);
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireMove, mockDestination);
        });
    });

    describe('turn management', () => {
        it('should emit end turn event', () => {
            service.endTurn();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.EndTurn);
        });

        it('should emit end action event', () => {
            service.endAction();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.EndAction);
        });

        it('should handle change turn events', () => {
            service.initialize();
            const nextPlayer = 'player1';
            mockSocketSubject.next(nextPlayer);

            expect(playerListService.updateCurrentPlayer).toHaveBeenCalledWith(nextPlayer);
            expect(gameTimeService.setStartTime).toHaveBeenCalledWith(START_TURN_DELAY);
        });

        it('should handle start turn events', () => {
            service.initialize();
            const initialTime = TURN_DURATION;
            mockSocketSubject.next(initialTime);

            expect(gameTimeService.setStartTime).toHaveBeenCalledWith(initialTime);
        });

        it('should handle TurnInfo events and update rendererState and player attributes when currentPlayer is true', () => {
            const mockCurrentPlayer: Player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
            const mockTurnInfo: TurnInformation = { attributes: mockCurrentPlayer.playerInGame.attributes } as TurnInformation;

            playerListService.getCurrentPlayer.and.returnValue(mockCurrentPlayer);

            service['listenToTurnInfo']();
            mockSocketSubject.next(mockTurnInfo);

            expect(service['rendererState'].updateTurnInfo).toHaveBeenCalled();

            expect(mockCurrentPlayer.playerInGame.attributes).toEqual(mockTurnInfo.attributes);
        });
    });

    describe('door management', () => {
        it('should send open door request', () => {
            const doorLocation = { x: 1, y: 1 };
            service.sendOpenDoor(doorLocation);
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireToggleDoor, doorLocation);
        });

        it('should handle door opening events and not call endAction when the conditions are not met', () => {
            const mockCurrentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
            const doorOutput = {
                updatedTileTerrain: TileTerrain.OpenDoor,
                doorPosition: { x: 2, y: 3 },
            };
            playerListService.getCurrentPlayer.and.returnValue(mockCurrentPlayer);
            playerListService.isCurrentPlayerAI.and.returnValue(false);
            spyOn(service, 'endAction');

            service['listenToOpenDoor']();
            mockSocketSubject.next(doorOutput);

            expect(mockCurrentPlayer.playerInGame.remainingActions).toBe(0);
            expect(gameMapService.updateDoorState).toHaveBeenCalledWith(doorOutput.updatedTileTerrain, doorOutput.doorPosition);
        });

        it('should handle door opening events and call endAction when the player is AI', () => {
            const mockCurrentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
            const doorOutput = {
                updatedTileTerrain: TileTerrain.OpenDoor,
                doorPosition: { x: 4, y: 5 },
            };
            playerListService.getCurrentPlayer.and.returnValue(mockCurrentPlayer);
            playerListService.isCurrentPlayerAI.and.returnValue(true);
            spyOn(service, 'endAction');

            service['listenToOpenDoor']();
            mockSocketSubject.next(doorOutput);

            expect(mockCurrentPlayer.playerInGame.remainingActions).toBe(0);
            expect(gameMapService.updateDoorState).toHaveBeenCalledWith(doorOutput.updatedTileTerrain, doorOutput.doorPosition);
            expect(service.endAction).toHaveBeenCalled();
        });
    });

    describe('endFightAction', () => {
        it('should emit EndFightAction event', () => {
            service.endFightAction();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.EndFightAction);
        });
    });

    describe('sendItemDropChoice', () => {
        it('should emit DesireDropItem event with correct item', () => {
            service.sendItemDropChoice(ItemType.GlassStone);
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireDropItem, ItemType.GlassStone);
        });
    });

    describe('item usage management', () => {
        it('should emit the desire to use an item with the correct payload', () => {
            const mockItemUsedPayload: ItemUsedPayload = { usagePosition: { x: 0, y: 0 }, type: ItemType.GeodeBomb };
            service.sendItemUsed(mockItemUsedPayload);

            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireUseItem, mockItemUsedPayload);
        });
    });

    describe('listenToPlayerSlip', () => {
        it('should set up a listener for player slip events and handle the emitted value correctly', () => {
            const mockPlayerSlipSubject = new Subject<string>();
            socketService.on.and.returnValue(mockPlayerSlipSubject.asObservable());

            service.listenToPlayerSlip().subscribe((slipEvent) => {
                expect(slipEvent).toBe(mockSlipMessage);
            });

            const mockSlipMessage = 'PlayerSlippedEvent';
            mockPlayerSlipSubject.next(mockSlipMessage);

            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.PlayerSlipped);
        });
    });

    describe('listenToLastStanding', () => {
        it('should set up a listener for LastStanding events and return the expected observable', () => {
            const result = service.listenToLastStanding();

            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.LastStanding);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Observable);
        });
    });

    describe('listenToEndGame', () => {
        it('should return an observable that listens for EndGame events', () => {
            const observable = service.listenToEndGame();

            expect(observable).toBeDefined();
            expect(observable).toBeInstanceOf(Observable);
        });
    });

    describe('game start management', () => {
        it('should send start game request', () => {
            service.sendStartGame();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireStartGame);
        });

        it('should handle game start events', () => {
            const startInfo = {
                playerStarts: MOCK_PLAYER_STARTS,
                map: MOCK_NEW_MAP,
            };

            service.listenToStartGame();
            mockSocketSubject.next(startInfo);

            expect(router.navigate).toHaveBeenCalledWith(['/play']);
            expect(playerListService.preparePlayersForGameStart).toHaveBeenCalledWith(startInfo.playerStarts);
            expect(gameMapService.map).toEqual(startInfo.map);
        });
    });

    describe('listenToPlayerMove', () => {
        it('should set up a listener for player move events and return the expected observable', () => {
            const result = service.listenToPlayerMove();

            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.PlayerMove);
            expect(result).toBeInstanceOf(Observable);
        });
    });

    describe('listenToItemPickedUp', () => {
        it('should set up a listener for player pickup Items and return the expected observable', () => {
            const result = service['listenToItemPickedUp']();

            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.ItemPickedUp);
            expect(result).toBeInstanceOf(Subscription);
        });
    });

    describe('listenToItemDropped', () => {
        it('should set up a listener for player pickup Items and return the expected observable', () => {
            const result = service['listenToItemDropped']();

            expect(socketService.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.ItemDropped);
            expect(result).toBeInstanceOf(Subscription);
        });
    });

    describe('cleanup', () => {
        let subscriptionSpies: jasmine.SpyObj<Subscription>[];
        beforeEach(() => {
            subscriptionSpies = Array(NUMB_SUBSCRIPTIONS)
                .fill(null)
                .map(() => jasmine.createSpyObj('Subscription', ['unsubscribe']));
            service.initialize();

            service['changeTurnSubscription'] = subscriptionSpies[0];
            service['startTurnSubscription'] = subscriptionSpies[1];
            service['doorSubscription'] = subscriptionSpies[2];
            service['turnInfoListener'] = subscriptionSpies[3];
            service['itemPickedUpListener'] = subscriptionSpies[4];
            service['itemDroppedListener'] = subscriptionSpies[5];
            service['inventoryFullListener'] = subscriptionSpies[6];
            service['closeItemDropModalListener'] = subscriptionSpies[7];
            service['bombUsedListener'] = subscriptionSpies[8];
            service['playerDeadListener'] = subscriptionSpies[9];
            service['itemPlacedListener'] = subscriptionSpies[10];
            service['itemLostListener'] = subscriptionSpies[11];
        });
        it('should unsubscribe from all subscriptions', () => {
            service.cleanup();

            subscriptionSpies.forEach((subscriptionSpy) => {
                expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
            });
        });
    });

    describe('player abandonment', () => {
        it('should emit player abandon event', () => {
            service.sendPlayerAbandon();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.Abandoned);
        });
    });
});
