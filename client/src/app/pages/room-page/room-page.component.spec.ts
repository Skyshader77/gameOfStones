import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
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
import { RoomPageComponent } from './room-page.component';

describe('RoomPageComponent', () => {
    let component: RoomPageComponent;
    let fixture: ComponentFixture<RoomPageComponent>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;
    let refreshSpy: jasmine.SpyObj<RefreshService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let roomStateSpy: jasmine.SpyObj<RoomStateService>;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let gameLogicSpy: jasmine.SpyObj<GameLogicSocketService>;
    let roomSocketSpy: jasmine.SpyObj<RoomSocketService>;
    let chatListSpy: jasmine.SpyObj<ChatListService>;

    beforeEach(async () => {
        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(MOCK_ROOM.roomCode),
                },
            },
        });
        refreshSpy = jasmine.createSpyObj('RefreshService', ['wasRefreshed']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', ['isOrganizer', 'getUserName']);
        myPlayerSpy.isOrganizer.and.returnValue(true);

        roomStateSpy = jasmine.createSpyObj('RoomStateService', ['initialize', 'onCleanUp']);
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showDecisionMessage', 'setMessage']);
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['listenPlayerListUpdated', 'removalConfirmation$']);

        gameLogicSpy = jasmine.createSpyObj('GameLogicSocketService', ['listenToStartGame']);
        roomSocketSpy = jasmine.createSpyObj('RoomSocketService', ['leaveRoom', 'toggleRoomLock']);
        chatListSpy = jasmine.createSpyObj('ChatListService', ['startChat']);

        await TestBed.configureTestingModule({
            imports: [RoomPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: RefreshService, useValue: refreshSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: RoomStateService, useValue: roomStateSpy },
                { provide: ModalMessageService, useValue: modalMessageSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: GameLogicSocketService, useValue: gameLogicSpy },
                { provide: RoomSocketService, useValue: roomSocketSpy },
                { provide: ChatListService, useValue: chatListSpy },
            ],
        }).compileComponents();

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
        expect(modalMessageSpy.setMessage).toHaveBeenCalledWith(LEAVE_ROOM_CONFIRMATION_MESSAGE);
    });

    it('should subscribe to player list updates', () => {
        component.ngOnInit();
        expect(playerListSpy.listenPlayerListUpdated).toHaveBeenCalled();
    });

    it('should handle removal confirmation', () => {
        component.ngOnInit();
        expect(modalMessageSpy.showDecisionMessage).toHaveBeenCalledWith(KICK_PLAYER_CONFIRMATION_MESSAGE);
    });

    it('should call quitRoom when handling accept event for leaving', () => {
        spyOn(component, 'quitRoom').and.callThrough();
        component.displayLeavingConfirmation(); // Simulate displaying leave confirmation
        component.handleAcceptEvent();
        expect(component.quitRoom).toHaveBeenCalled();
    });

    it('should clean up subscriptions on destroy', () => {
        spyOn(component['playerListSubscription'], 'unsubscribe');
        spyOn(component['gameStartSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(component['playerListSubscription'].unsubscribe).toHaveBeenCalled();
        expect(component['gameStartSubscription'].unsubscribe).toHaveBeenCalled();
        expect(roomStateSpy.onCleanUp).toHaveBeenCalled();
    });
});
