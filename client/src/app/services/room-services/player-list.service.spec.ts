import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { SocketService } from '@app/services/communication-services/socket.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Observable, of } from 'rxjs';
import { MyPlayerService } from './my-player.service';
import { PlayerListService } from './player-list.service';
import { ROOM_CLOSED_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { MOCK_PLAYER_STARTS_TESTS, MOCK_PLAYERS } from '@app/constants/tests.constants';

describe('PlayerListService', () => {
    let service: PlayerListService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let modalMessageServiceSpy: jasmine.SpyObj<ModalMessageService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);
        socketServiceSpy.on.and.returnValue(of([MOCK_PLAYERS[0]]));
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        myPlayerServiceSpy = jasmine.createSpyObj('MyPlayerService', ['getUserName'], { isCurrentPlayer: false });
        modalMessageServiceSpy = jasmine.createSpyObj('ModalMessageService', ['setMessage']);
        TestBed.configureTestingModule({
            providers: [
                PlayerListService,
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ModalMessageService, useValue: modalMessageServiceSpy },
            ],
        });

        service = TestBed.inject(PlayerListService);
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        service.playerList = [{ playerInfo: { userName: 'Player1' } } as Player, { playerInfo: { userName: 'Player2' } } as Player];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit DesireKickPlayer event when removePlayer is called', () => {
        const playerNameToRemove = 'Player 1';
        service.removePlayer(playerNameToRemove);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.DesireKickPlayer, playerNameToRemove);
    });

    it('should remove the specified player from playerList when that player has abandonned', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.GAME && event === GameEvents.PlayerAbandoned) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service.listenToPlayerAbandon();
        expect(service.playerList.length).toBe(1);
        expect(service.playerList.some((player) => player.playerInfo.userName === 'Player1')).toBeFalse();
    });

    it('should navigate to /init and display kicked message if current player is removed because they have abandonned', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.GAME && event === GameEvents.PlayerAbandoned) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service.listenToPlayerAbandon();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should remove the specified player from playerList when that player has been kicked out', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.ROOM && event === RoomEvents.RemovePlayer) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service.listenPlayerRemoved();
        expect(service.playerList.length).toBe(1);
        expect(service.playerList.some((player) => player.playerInfo.userName === 'Player1')).toBeFalse();
    });

    it('should navigate to /init and display kicked message if current player is removed', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.ROOM && event === RoomEvents.RemovePlayer) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service.listenPlayerRemoved();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should update currentPlayerName and remainingActions if the player exists', () => {
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1], MOCK_PLAYERS[2]];
        MOCK_PLAYERS[0].playerInGame.remainingActions = 0;
        myPlayerServiceSpy.getUserName.and.returnValue(MOCK_PLAYERS[0].playerInfo.userName);
        service.updateCurrentPlayer(MOCK_PLAYERS[0].playerInfo.userName);
        expect(service.currentPlayerName).toBe(MOCK_PLAYERS[0].playerInfo.userName);
        expect(MOCK_PLAYERS[0].playerInGame.remainingActions).toBe(1);
    });

    it('should set isCurrentPlayer to false when currentPlayer does not match username', () => {
        myPlayerServiceSpy.getUserName.and.returnValue(MOCK_PLAYERS[0].playerInfo.userName);
        service.updateCurrentPlayer(MOCK_PLAYERS[1].playerInfo.userName);
        expect(service.currentPlayerName).toBe(MOCK_PLAYERS[1].playerInfo.userName);
        expect(myPlayerServiceSpy.isCurrentPlayer).toBeFalse();
    });

    it('should not change remainingActions if the current player does not exist', () => {
        service.playerList = [MOCK_PLAYERS[1]];
        myPlayerServiceSpy.getUserName.and.returnValue(MOCK_PLAYERS[1].playerInfo.userName);
        service.updateCurrentPlayer(MOCK_PLAYERS[2].playerInfo.userName);
        expect(MOCK_PLAYERS[2].playerInGame.remainingActions).toBe(1);
    });

    it('should emit the provided username on removal confirmation', () => {
        const confirmationSpy = jasmine.createSpy();
        service.removalConfirmation$.subscribe(confirmationSpy);
        service.askPlayerRemovalConfirmation(MOCK_PLAYERS[0].playerInfo.userName);
        expect(confirmationSpy).toHaveBeenCalledWith(MOCK_PLAYERS[0].playerInfo.userName);
    });

    it('should return the current player when they exist in the player list', () => {
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];
        service.currentPlayerName = MOCK_PLAYERS[0].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toEqual(MOCK_PLAYERS[0]);
    });

    it('should return undefined when the current player does not exist in the player list', () => {
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];
        service.currentPlayerName = MOCK_PLAYERS[2].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toBeUndefined();
    });

    it('should return undefined when the player list is empty', () => {
        service.playerList = [];
        service.currentPlayerName = MOCK_PLAYERS[0].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toBeUndefined();
    });

    it('should update playerList when receiving player list updates from the socket', () => {
        socketServiceSpy.on.and.returnValue(of(MOCK_PLAYERS));
        const subscription = service.listenPlayerListUpdated();
        expect(service.playerList).toEqual(MOCK_PLAYERS);
        subscription.unsubscribe();
    });

    it('should add a player to playerList when a player is added via the socket', () => {
        socketServiceSpy.on.and.returnValue(of(MOCK_PLAYERS[0]));
        const subscription = service.listenPlayerAdded();
        expect(service.playerList).toContain(MOCK_PLAYERS[0]);
        subscription.unsubscribe();
    });

    it('should navigate to /init and set a room closed message when the room is closed', () => {
        const roomClosedEvent = of(void 0);
        socketServiceSpy.on.and.returnValue(roomClosedEvent);
        const subscription = service.listenRoomClosed();
        expect(modalMessageServiceSpy.setMessage).toHaveBeenCalledWith(ROOM_CLOSED_MESSAGE);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
        subscription.unsubscribe();
    });

    it('should return the remaining actions of the current player', () => {
        service.currentPlayerName = MOCK_PLAYERS[0].playerInfo.userName;
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];
        const actions = service.actionsLeft();
        expect(actions).toBe(MOCK_PLAYERS[0].playerInGame.remainingActions);
    });

    it('should return 0 if current player is not found in the player list', () => {
        service.currentPlayerName = MOCK_PLAYERS[2].playerInfo.userName;
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];
        const actions = service.actionsLeft();
        expect(actions).toBe(0);
    });

    it('should update playerList with correct start and current positions for players', () => {
        service.playerList = [MOCK_PLAYERS[0], MOCK_PLAYERS[1]];

        // console.log(service.playerList[0].playerInfo.userName)
        // console.log(service.playerList[0].playerInGame.startPosition)
        // console.log(service.playerList[0].playerInGame.currentPosition)
        // console.log(service.playerList[1].playerInfo.userName)
        // console.log(service.playerList[1].playerInGame.startPosition)
        // console.log(service.playerList[1].playerInGame.currentPosition)
        service.preparePlayersForGameStart(MOCK_PLAYER_STARTS_TESTS);
        // console.log(service.playerList[0].playerInfo.userName)
        // console.log(service.playerList[0].playerInGame.startPosition)
        // console.log(service.playerList[0].playerInGame.currentPosition)
        // console.log(service.playerList[1].playerInfo.userName)
        // console.log(service.playerList[1].playerInGame.startPosition)
        // console.log(service.playerList[1].playerInGame.currentPosition)

        // Assertions to check that player positions were set correctly
        expect(service.playerList[0].playerInGame.startPosition).toEqual({ x: 1, y: 1 });
        expect(service.playerList[0].playerInGame.currentPosition).toEqual({ x: 1, y: 1 });
        expect(service.playerList[1].playerInGame.startPosition).toEqual({ x: 6, y: 6 });
        expect(service.playerList[1].playerInGame.currentPosition).toEqual({ x: 6, y: 6 });
    });
});
