import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { KICK_PLAYER_CONFIRMATION_MESSAGE, LEAVE_ROOM_CONFIRMATION_MESSAGE } from '@app/constants/room.constants';
import { MOCK_ROOM } from '@app/constants/tests.constants';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { of, Subject, Subscription } from 'rxjs';
import { RoomPageComponent } from './room-page.component';

@Component({
    selector: 'app-player-list',
    standalone: true,
    template: '',
})
class MockPlayerListComponent {}

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

describe('RoomPageComponent', () => {
    let component: RoomPageComponent;
    let fixture: ComponentFixture<RoomPageComponent>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;
    let routerSpy: jasmine.SpyObj<Router>;
    let refreshSpy: jasmine.SpyObj<RefreshService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let roomStateSpy: jasmine.SpyObj<RoomStateService>;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let gameLogicSpy: jasmine.SpyObj<GameLogicSocketService>;
    let roomSocketSpy: jasmine.SpyObj<RoomSocketService>;
    let chatListSpy: jasmine.SpyObj<ChatListService>;

    let removalConfirmationSubject: Subject<string>;

    beforeEach(async () => {
        removalConfirmationSubject = new Subject<string>();

        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(MOCK_ROOM.roomCode),
                },
            },
        });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        refreshSpy = jasmine.createSpyObj('RefreshService', ['wasRefreshed']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', ['isOrganizer']);
        myPlayerSpy.isOrganizer.and.returnValue(true);

        roomStateSpy = jasmine.createSpyObj('RoomStateService', ['initialize', 'onCleanUp']);
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showDecisionMessage', 'setMessage'], {
            message$: of(null),
            decisionMessage$: of(null),
        });

        playerListSpy = jasmine.createSpyObj('PlayerListService', {
            listenPlayerListUpdated: new Subscription(),
            removePlayer: undefined,
        });

        Object.defineProperty(playerListSpy, 'removalConfirmation$', {
            get: () => removalConfirmationSubject.asObservable(),
        });

        gameLogicSpy = jasmine.createSpyObj('GameLogicSocketService', { listenToStartGame: new Subscription(), sendStartGame: undefined });
        roomSocketSpy = jasmine.createSpyObj('RoomSocketService', ['leaveRoom', 'toggleRoomLock']);
        chatListSpy = jasmine.createSpyObj('ChatListService', ['startChat', 'initializeChat']);

        await TestBed.configureTestingModule({
            imports: [RoomPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: Router, useValue: routerSpy },
                { provide: RefreshService, useValue: refreshSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: RoomStateService, useValue: roomStateSpy },
                { provide: ModalMessageService, useValue: modalMessageSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameLogicSocketService, useValue: gameLogicSpy },
                { provide: RoomSocketService, useValue: roomSocketSpy },
                { provide: ChatListService, useValue: chatListSpy },
            ],
        })
            .overrideComponent(RoomPageComponent, {
                add: { imports: [MockPlayerListComponent, MockChatComponent] },
                remove: { imports: [PlayerListComponent, ChatComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(RoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize roomCode from the route', () => {
        component.ngOnInit();
        expect(component.roomCode).toBe(MOCK_ROOM.roomCode);
    });

    it('should navigate to init page if refreshed', () => {
        refreshSpy.wasRefreshed.and.returnValue(true);
        component.ngOnInit();
        expect(modalMessageSpy.setMessage).toHaveBeenCalledWith(LEFT_ROOM_MESSAGE);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should subscribe to player list updates', () => {
        component.ngOnInit();
        expect(playerListSpy.listenPlayerListUpdated).toHaveBeenCalled();
    });

    it('should call quitRoom when handling accept event for leaving', () => {
        spyOn(component, 'quitRoom');
        component.handleAcceptEvent();
        expect(component.quitRoom).toHaveBeenCalled();
    });

    it('should call removePlayer with the correct name when kickingPlayer is true', () => {
        component.kickingPlayer = true;
        component.removedPlayerName = 'testPlayer';
        spyOn(component, 'quitRoom');

        component.handleAcceptEvent();

        expect(playerListSpy.removePlayer).toHaveBeenCalledWith('testPlayer');
        expect(component.quitRoom).not.toHaveBeenCalled();
    });

    it('should leave room and navigate to init page', () => {
        component.quitRoom();
        expect(roomSocketSpy.leaveRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should display leave room confirmation message', () => {
        component.displayLeavingConfirmation();
        expect(component.kickingPlayer).toBeFalse();
        expect(modalMessageSpy.showDecisionMessage).toHaveBeenCalledWith(LEAVE_ROOM_CONFIRMATION_MESSAGE);
    });

    it('should clean up subscriptions on destroy', () => {
        spyOn(component['playerListSubscription'], 'unsubscribe');
        spyOn(component['gameStartSubscription'], 'unsubscribe');
        spyOn(component['removalConfirmationSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(component['playerListSubscription'].unsubscribe).toHaveBeenCalled();
        expect(component['gameStartSubscription'].unsubscribe).toHaveBeenCalled();
        expect(component['removalConfirmationSubscription'].unsubscribe).toHaveBeenCalled();
        expect(roomStateSpy.onCleanUp).toHaveBeenCalled();
    });

    it('should display confirmation modal when kicking player', () => {
        const testUserName = 'testUser';
        removalConfirmationSubject.next(testUserName);
        expect(component.removedPlayerName).toBe(testUserName);
        expect(component.kickingPlayer).toBeTrue();
        expect(modalMessageSpy.showDecisionMessage).toHaveBeenCalledWith(KICK_PLAYER_CONFIRMATION_MESSAGE);
    });

    it('should handle the case where roomCode id is undefined', () => {
        (routeSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue(undefined);

        component.ngOnInit();

        expect(component.roomCode).toBe('');
    });

    it('should toggle room lock', () => {
        component.toggleRoomLock();
        expect(roomSocketSpy.toggleRoomLock).toHaveBeenCalledWith(component.roomCode);
    });

    it('should start game when onStartGame is called', () => {
        component.onStartGame();
        expect(gameLogicSpy.sendStartGame).toHaveBeenCalled();
    });
});
