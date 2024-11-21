import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DecisionModalComponent } from '@app/components/decision-modal-dialog/decision-modal.component';
import * as joinConstants from '@app/constants/join-page.constants';
import {
    MOCK_ACTIVATED_ROUTE,
    MOCK_INVALID_ROOM_CODE,
    MOCK_PLAYERS,
    MOCK_PLAYER_FORM_DATA_HP_ATTACK,
    MOCK_VALID_ROOM_CODE,
} from '@app/constants/tests.constants';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { Avatar } from '@common/enums/avatar.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Subject, of } from 'rxjs';
import { JoinPageComponent } from './join-page.component';
import { AudioService } from '@app/services/audio/audio.service';

interface RetryJoinModal extends DecisionModalComponent {
    closeDialog: jasmine.Spy;
    isOpen: boolean;
}

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;

    let roomJoiningService: jasmine.SpyObj<RoomJoiningService>;
    let roomStateService: jasmine.SpyObj<RoomStateService>;
    let modalMessageService: jasmine.SpyObj<ModalMessageService>;
    let playerCreationService: jasmine.SpyObj<PlayerCreationService>;
    let routerService: jasmine.SpyObj<Router>;
    let refreshService: jasmine.SpyObj<RefreshService>;
    let roomSocketService: jasmine.SpyObj<RoomSocketService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let avatarListService: jasmine.SpyObj<AvatarListService>;
    let audioSpy: jasmine.SpyObj<AudioService>;

    let avatarListSubject: Subject<boolean[]>;

    beforeEach(async () => {
        modalMessageService = jasmine.createSpyObj('ModalMessageService', ['showMessage', 'showDecisionMessage'], {
            message$: of(null),
            decisionMessage$: of(null),
        });

        roomStateService = jasmine.createSpyObj('RoomStateService', { roomCode: '1234' });

        playerCreationService = jasmine.createSpyObj('PlayerCreationService', ['createPlayer']);
        routerService = jasmine.createSpyObj('Router', ['navigate']);
        refreshService = jasmine.createSpyObj('RefreshService', ['setRefreshDetector']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);
        audioSpy = jasmine.createSpyObj('AudioService', ['playSfx']);

        avatarListService = jasmine.createSpyObj('AvatarListService', ['setSelectedAvatar', 'sendPlayerCreationClosed'], {
            selectedAvatar: of(Avatar.FemaleHealer),
        });

        roomSocketService = jasmine.createSpyObj('RoomSocketService', {
            listenForJoinError: of(null),
            listenForAvatarList: of([]),
            listenForAvatarSelected: of(null),
            listenForRoomJoined: of(null),
        });

        avatarListSubject = new Subject<boolean[]>();
        roomSocketService.listenForAvatarList.and.returnValue(of([true, false]));

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
                { provide: RoomStateService, useValue: roomStateService },
                { provide: RefreshService, useValue: refreshService },
                { provide: ModalMessageService, useValue: modalMessageService },
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: Router, useValue: routerService },
                { provide: PlayerCreationService, useValue: playerCreationService },
                { provide: RoomSocketService, useValue: roomSocketService },
                { provide: AvatarListService, useValue: avatarListService },
                { provide: ActivatedRoute, useValue: MOCK_ACTIVATED_ROUTE },
                { provide: AudioService, useValue: audioSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const mockDialogElement = {
            open: false,
            close: jasmine.createSpy('close'),
            showModal: jasmine.createSpy('showModal'),
        } as unknown as HTMLDialogElement;

        component.playerCreationModal = {
            nativeElement: mockDialogElement,
        } as ElementRef<HTMLDialogElement>;

        component.retryJoinModal = {
            closeDialog: jasmine.createSpy('closeDialog'),
            get isOpen() {
                return false;
            },
        } as RetryJoinModal;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the player creation modal after the timeout', fakeAsync(() => {
        component.ngOnInit();
        avatarListSubject.next([true, false]);
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
        expect(roomStateService.roomCode).toBe(MOCK_VALID_ROOM_CODE);
        expect(roomJoiningService.handlePlayerCreationOpened).toHaveBeenCalledWith(MOCK_VALID_ROOM_CODE);
    });

    it('should create player and request to join the room on submit', () => {
        playerCreationService.createPlayer.and.returnValue(MOCK_PLAYERS[0]);
        component.onSubmit(MOCK_PLAYER_FORM_DATA_HP_ATTACK);
        expect(playerCreationService.createPlayer).toHaveBeenCalledWith(MOCK_PLAYER_FORM_DATA_HP_ATTACK, PlayerRole.Human);
        expect(roomJoiningService.playerToJoin).toEqual(MOCK_PLAYERS[0]);
        expect(roomJoiningService.requestJoinRoom).toHaveBeenCalledWith(component.roomCode);
    });

    it('should send player creation closed when form is closed', () => {
        roomStateService['roomCode'] = MOCK_VALID_ROOM_CODE;
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

    it('should emit modal close event if modal is opened and redirect to init page', () => {
        component.playerCreationModal.nativeElement.open = true;
        component.handleCloseEvent();
        expect(avatarListService.sendPlayerCreationClosed).toHaveBeenCalledWith(component.roomCode);
        expect(routerService.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should not emit modal close event if modal is closed and redirect to init page', () => {
        component.playerCreationModal.nativeElement.open = false;
        component.handleCloseEvent();
        expect(avatarListService.sendPlayerCreationClosed).not.toHaveBeenCalled();
        expect(routerService.navigate).toHaveBeenCalledWith(['/init']);
    });
});
