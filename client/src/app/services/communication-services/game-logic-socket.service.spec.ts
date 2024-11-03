import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { GameLogicSocketService } from './game-logic-socket.service';
import { SocketService } from './socket.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Subject, Subscription } from 'rxjs';
import { START_TURN_DELAY, TURN_DURATION } from '@common/constants/gameplay.constants';
import { MOCK_NEW_MAP, MOCK_PLAYER_STARTS } from '@app/constants/tests.constants';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

const NUMB_SUBSCRIPTIONS = 3;
describe('GameLogicSocketService', () => {
    let service: GameLogicSocketService;
    let socketService: jasmine.SpyObj<SocketService>;
    let playerListService: jasmine.SpyObj<PlayerListService>;
    let gameTimeService: jasmine.SpyObj<GameTimeService>;
    let router: jasmine.SpyObj<Router>;
    let gameMapService: jasmine.SpyObj<GameMapService>;

    const mockSocketSubject = new Subject();

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        const playerListSpy = jasmine.createSpyObj('PlayerListService', ['preparePlayersForGameStart', 'updateCurrentPlayer']);
        const gameTimeSpy = jasmine.createSpyObj('GameTimeService', ['setStartTime']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const gameMapSpy = jasmine.createSpyObj('GameMapService', ['updateDoorState']);

        socketSpy.on.and.returnValue(mockSocketSubject);

        TestBed.configureTestingModule({
            providers: [
                GameLogicSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameTimeService, useValue: gameTimeSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameMapService, useValue: gameMapSpy },
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
            expect(socketService.on).toHaveBeenCalledWith(Gateway.GAME, GameEvents.ChangeTurn);
            expect(socketService.on).toHaveBeenCalledWith(Gateway.GAME, GameEvents.StartTurn);
            expect(socketService.on).toHaveBeenCalledWith(Gateway.GAME, GameEvents.PlayerDoor);
        });
    });

    describe('processMovement', () => {
        it('should emit desired move event with destination', () => {
            const mockDestination = { x: 1, y: 1 };
            service.processMovement(mockDestination);
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesiredMove, mockDestination);
        });
    });

    describe('turn management', () => {
        it('should emit end turn event', () => {
            service.endTurn();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.EndTurn);
        });

        it('should emit end action event', () => {
            service.endAction();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.EndAction);
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
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesiredDoor, doorLocation);
        });

        it('should handle door opening events', () => {
            service.initialize();
            const doorOutput = {
                updatedTileTerrain: TileTerrain.OpenDoor,
                doorPosition: { x: 1, y: 1 },
            };
            mockSocketSubject.next(doorOutput);

            expect(gameMapService.updateDoorState).toHaveBeenCalledWith(doorOutput.updatedTileTerrain, doorOutput.doorPosition);
        });
    });

    describe('game start management', () => {
        it('should send start game request', () => {
            service.sendStartGame();
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesireStartGame);
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

    describe('movement preview', () => {
        it('should listen for movement preview events', () => {
            service.listenToMovementPreview();
            expect(socketService.on).toHaveBeenCalledWith(Gateway.GAME, GameEvents.MapPreview);
        });

        it('should listen for possible player movement events', () => {
            service.listenToPossiblePlayerMovement();
            expect(socketService.on).toHaveBeenCalledWith(Gateway.GAME, GameEvents.PossibleMovement);
        });
    });

    describe('cleanup', () => {
        let changeTurnSubject: Subject<unknown>;
        let startTurnSubject: Subject<unknown>;
        let doorSubject: Subject<unknown>;
        let subscriptionSpies: jasmine.SpyObj<Subscription>[];

        beforeEach(() => {
            changeTurnSubject = new Subject();
            startTurnSubject = new Subject();
            doorSubject = new Subject();

            socketService.on.and.returnValues(changeTurnSubject, startTurnSubject, doorSubject);

            subscriptionSpies = Array(NUMB_SUBSCRIPTIONS)
                .fill(null)
                .map(() => jasmine.createSpyObj('Subscription', ['unsubscribe']));
            spyOn(changeTurnSubject, 'subscribe').and.returnValue(subscriptionSpies[0]);
            spyOn(startTurnSubject, 'subscribe').and.returnValue(subscriptionSpies[1]);
            spyOn(doorSubject, 'subscribe').and.returnValue(subscriptionSpies[2]);

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
            expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.Abandoned);
        });
    });
});
