import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { JoinPageComponent } from './join-page.component';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { AvatarChoice, PlayerRole } from '@common/constants/player.constants';
import { Subject, of } from 'rxjs';
import { JoinErrors } from '@common/interfaces/join-errors';
import * as joinConstants from '@common/constants/join-page.constants';
import {
    MOCK_ACTIVATED_ROUTE,
    MOCK_PLAYERS,
    MOCK_PLAYER_FORM_DATA_HP_ATTACK,
    MOCK_VALID_ROOM_CODE,
    MOCK_INVALID_ROOM_CODE,
} from '@app/constants/tests.constants';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;

    let roomJoiningService: jasmine.SpyObj<RoomJoiningService>;
    let modalMessageService: jasmine.SpyObj<ModalMessageService>;
    let playerCreationService: jasmine.SpyObj<PlayerCreationService>;
    let routerService: jasmine.SpyObj<Router>;
    let refreshService: jasmine.SpyObj<RefreshService>;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let avatarListService: jasmine.SpyObj<AvatarListService>;

    let avatarListSubject: Subject<any>;

    beforeEach(async () => {
        modalMessageService = jasmine.createSpyObj('ModalMessageService', ['showMessage', 'showDecisionMessage'], {
            message$: of(null),
            decisionMessage$: of(null),
        });

        playerCreationService = jasmine.createSpyObj('PlayerCreationService', ['createPlayer']);
        routerService = jasmine.createSpyObj('Router', ['navigate']);
        refreshService = jasmine.createSpyObj('RefreshService', ['setRefreshDetector']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);

        avatarListService = jasmine.createSpyObj('AvatarListService', ['setSelectedAvatar', 'sendPlayerCreationClosed'], {
            selectedAvatar: of(AvatarChoice.AVATAR0),
        });

        roomSocketService = jasmine.createSpyObj('RoomSocketService', {
            listenForJoinError: of(null),
            listenForAvatarList: of([]),
            listenForAvatarSelected: of(null),
            listenForRoomJoined: of(null),
        });

        avatarListSubject = new Subject<any>();
        roomSocketService.listenForAvatarList.and.returnValue(avatarListSubject.asObservable());

        roomJoiningService = jasmine.createSpyObj(
            'RoomJoiningService',
            ['isValidInput', 'doesRoomExist', 'handlePlayerCreationOpened', 'requestJoinRoom'],
            {
                playerToJoin: MOCK_PLAYERS[0],
            },
        );

        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
            providers: [
                { provide: RoomJoiningService, useValue: roomJoiningService },
                { provide: RefreshService, useValue: refreshService },
                { provide: ModalMessageService, useValue: modalMessageService },
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: Router, useValue: routerService },
                { provide: PlayerCreationService, useValue: playerCreationService },
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: AvatarListService, useValue: avatarListService },
                { provide: ActivatedRoute, useValue: MOCK_ACTIVATED_ROUTE },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.playerCreationModal = {
            nativeElement: {
                open: false,
                close: jasmine.createSpy('close'),
            },
        } as any;

        component.retryJoinModal = {
            closeDialog: jasmine.createSpy('closeDialog'),
            get isOpen() {
                return false;
            },
        } as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the player creation modal after the timeout', fakeAsync(() => {
        component.playerCreationModal = {
            nativeElement: {
                showModal: jasmine.createSpy('showModal'),
            },
        } as any;
        component.ngOnInit();
        avatarListSubject.next([]);
        expect(component.playerCreationModal.nativeElement.showModal).not.toHaveBeenCalled();
        tick(joinConstants.TIME_BETWEEN_MODALS_MS);
        expect(component.playerCreationModal.nativeElement.showModal).toHaveBeenCalled();
    }));

    it('should return the correct playerToJoin', () => {
        expect(component.playerToJoin).toEqual(MOCK_PLAYERS[0]);
    });

    it('should show message and close modal for RoomDeleted error', () => {
        component.showErrorMessage(JoinErrors.RoomDeleted);
        expect(modalMessageService.showMessage).toHaveBeenCalledWith(joinConstants.ROOM_DELETED_ERROR_MESSAGE);
        expect(component.playerCreationModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should show decision message for RoomLocked error if modal is not open', () => {
        Object.defineProperty(component.retryJoinModal, 'isOpen', { value: false });
        component.showErrorMessage(JoinErrors.RoomLocked);
        expect(modalMessageService.showDecisionMessage).toHaveBeenCalledWith(joinConstants.ROOM_LOCKED_ERROR_MESSAGE);
    });

    it('should not show decision message for RoomLocked error if modal is open', () => {
        Object.defineProperty(component.retryJoinModal, 'isOpen', { value: true });
        component.showErrorMessage(JoinErrors.RoomLocked);
        expect(modalMessageService.showDecisionMessage).not.toHaveBeenCalled();
    });

    it('should show an error message for invalid input', () => {
        component.userInput = MOCK_INVALID_ROOM_CODE;
        roomJoiningService.isValidInput.and.returnValue(false);
        component.onJoinClicked();
        expect(modalMessageService.showMessage).toHaveBeenCalledWith(joinConstants.WRONG_FORMAT_ERROR_MESSAGE);
        expect(roomJoiningService.doesRoomExist).not.toHaveBeenCalled();
    });

    it('should show an error message if the room does not exist', () => {
        roomJoiningService.isValidInput.and.returnValue(true);
        roomJoiningService.doesRoomExist.and.returnValue(of(false));
        component.onJoinClicked();
        expect(modalMessageService.showMessage).toHaveBeenCalledWith(joinConstants.INVALID_ROOM_ERROR_MESSAGE);
    });

    it('should handle room existence correctly', () => {
        component.userInput = MOCK_VALID_ROOM_CODE;
        roomJoiningService.isValidInput.and.returnValue(true);
        roomJoiningService.doesRoomExist.and.returnValue(of(true));
        component.onJoinClicked();
        expect(roomJoiningService.roomCode).toBe(MOCK_VALID_ROOM_CODE);
        expect(roomJoiningService.handlePlayerCreationOpened).toHaveBeenCalledWith(MOCK_VALID_ROOM_CODE);
    });

    it('should create player and request to join the room on submit', () => {
        playerCreationService.createPlayer.and.returnValue(MOCK_PLAYERS[0]);
        component.onSubmit(MOCK_PLAYER_FORM_DATA_HP_ATTACK);
        expect(playerCreationService.createPlayer).toHaveBeenCalledWith(MOCK_PLAYER_FORM_DATA_HP_ATTACK, PlayerRole.HUMAN);
        expect(roomJoiningService.playerToJoin).toEqual(MOCK_PLAYERS[0]);
        expect(roomJoiningService.requestJoinRoom).toHaveBeenCalledWith(component.roomCode);
    });

    it('should send player creation closed when form is closed', () => {
        roomJoiningService.roomCode = MOCK_VALID_ROOM_CODE;
        component.onFormClosed();
        expect(avatarListService.sendPlayerCreationClosed).toHaveBeenCalledWith(MOCK_VALID_ROOM_CODE);
    });

    it('should call requestJoinRoom if the modal is open', () => {
        component.playerCreationModal.nativeElement.open = true;
        component.handleAcceptEvent();
        expect(roomJoiningService.requestJoinRoom).toHaveBeenCalledWith(component.roomCode);
        expect(roomJoiningService.handlePlayerCreationOpened).not.toHaveBeenCalled();
    });

    it('should call handlePlayerCreationOpened if the modal is closed', () => {
        component.playerCreationModal.nativeElement.open = false;
        component.handleAcceptEvent();
        expect(roomJoiningService.handlePlayerCreationOpened).toHaveBeenCalledWith(component.roomCode);
        expect(roomJoiningService.requestJoinRoom).not.toHaveBeenCalled();
    });

    it('should close the modal if it is open', () => {
        component.playerCreationModal.nativeElement.open = true;
        component.handleCloseEvent();
        expect(component.playerCreationModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should not close the modal if it is not open', () => {
        component.playerCreationModal.nativeElement.open = false;
        component.handleCloseEvent();
        expect(component.playerCreationModal.nativeElement.close).not.toHaveBeenCalled();
    });
});
