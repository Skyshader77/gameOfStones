import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_NEW_MAP, MOCK_PLAYERS, MOCK_PLAYER_STARTS } from '@app/constants/tests.constants';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { START_TURN_DELAY, TURN_DURATION } from '@common/constants/gameplay.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameLogicSocketService } from './game-logic-socket.service';
import { AudioService } from '@app/services/audio/audio.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

const NUMB_SUBSCRIPTIONS = 13;

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
        const renderingStateSpy = jasmine.createSpyObj('RenderingStateService', [], {
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
    });

    describe('door management', () => {
        it('should send open door request', () => {
            const doorLocation = { x: 1, y: 1 };
            service.sendOpenDoor(doorLocation);
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireToggleDoor, doorLocation);
        });

        it('should handle door opening events', () => {
            const mockCurrentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[1]));
            playerListService.getCurrentPlayer.and.returnValue(mockCurrentPlayer);

            service.initialize();
            const doorOutput = {
                updatedTileTerrain: TileTerrain.OpenDoor,
                doorPosition: { x: 1, y: 1 },
            };
            mockSocketSubject.next(doorOutput);

            expect(gameMapService.updateDoorState).toHaveBeenCalledWith(doorOutput.updatedTileTerrain, doorOutput.doorPosition);
            expect(mockCurrentPlayer.playerInGame.remainingActions).toBe(0);
        });
    });

    describe('endFightAction', () => {
        it('should emit EndFightAction event', () => {
            service.endFightAction();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.EndFightAction);
        });
    });

    describe('listenToPlayerSlip', () => {
        it('should set up a listener for player slip events and update hasTripped on event trigger', () => {
            const observable = service.listenToPlayerSlip();

            expect(observable).toBeDefined();
            expect(observable).toBeInstanceOf(Observable);
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
        let changeTurnSubject: Subject<unknown>;
        let startTurnSubject: Subject<unknown>;
        let doorSubject: Subject<unknown>;
        let turnInfoSubject: Subject<unknown>;
        let itemPickedUpSubject: Subject<unknown>;
        let itemDroppedSubject: Subject<unknown>;
        let inventoryFullSubject: Subject<unknown>;
        let closeItemDropModalSubject: Subject<unknown>;
        let bombUsedListener: Subject<unknown>;
        let playerDeadListener: Subject<unknown>;
        let hammerUsedListener: Subject<unknown>;
        let itemPlacedListener: Subject<unknown>;
        let itemLostListener: Subject<unknown>;

        let subscriptionSpies: jasmine.SpyObj<Subscription>[];
        beforeEach(() => {
            changeTurnSubject = new Subject();
            startTurnSubject = new Subject();
            doorSubject = new Subject();
            turnInfoSubject = new Subject();
            itemPickedUpSubject = new Subject();
            itemDroppedSubject = new Subject();
            inventoryFullSubject = new Subject();
            closeItemDropModalSubject = new Subject();
            bombUsedListener = new Subject();
            playerDeadListener = new Subject();
            hammerUsedListener = new Subject();
            itemPlacedListener = new Subject();
            itemLostListener = new Subject();

            socketService.on.and.returnValues(
                changeTurnSubject,
                startTurnSubject,
                doorSubject,
                turnInfoSubject,
                itemPickedUpSubject,
                itemDroppedSubject,
                inventoryFullSubject,
                closeItemDropModalSubject,
                bombUsedListener,
                playerDeadListener,
                hammerUsedListener,
                itemPlacedListener,
                itemLostListener,
            );

            subscriptionSpies = Array(NUMB_SUBSCRIPTIONS)
                .fill(null)
                .map(() => jasmine.createSpyObj('Subscription', ['unsubscribe']));
            spyOn(changeTurnSubject, 'subscribe').and.returnValue(subscriptionSpies[0]);
            spyOn(startTurnSubject, 'subscribe').and.returnValue(subscriptionSpies[1]);
            spyOn(doorSubject, 'subscribe').and.returnValue(subscriptionSpies[2]);
            spyOn(turnInfoSubject, 'subscribe').and.returnValue(subscriptionSpies[3]);
            spyOn(itemPickedUpSubject, 'subscribe').and.returnValue(subscriptionSpies[4]);
            spyOn(itemDroppedSubject, 'subscribe').and.returnValue(subscriptionSpies[5]);
            spyOn(inventoryFullSubject, 'subscribe').and.returnValue(subscriptionSpies[6]);
            spyOn(closeItemDropModalSubject, 'subscribe').and.returnValue(subscriptionSpies[8]);
            spyOn(bombUsedListener, 'subscribe').and.returnValue(subscriptionSpies[9]);
            spyOn(playerDeadListener, 'subscribe').and.returnValue(subscriptionSpies[10]);
            spyOn(hammerUsedListener, 'subscribe').and.returnValue(subscriptionSpies[11]);
            spyOn(itemPlacedListener, 'subscribe').and.returnValue(subscriptionSpies[12]);
            spyOn(itemLostListener, 'subscribe').and.returnValue(subscriptionSpies[7]);
            service.initialize();
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
