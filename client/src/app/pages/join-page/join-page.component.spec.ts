import { TestBed, ComponentFixture } from '@angular/core/testing';
import { JoinPageComponent } from './join-page.component';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { Player } from '@app/interfaces/player';
import { AvatarChoice, PlayerRole, DiceType } from '@common/constants/player.constants';
import { of } from 'rxjs';
import { SpriteSheetChoice } from '@app/constants/player.constants';
import * as joinConstants from '@common/constants/join-page.constants';
import { Statistic } from '@app/interfaces/stats';

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
    
    const mockActivatedRoute = {
        params: of({}),
        queryParams: of({})
    };

    beforeEach(async () => {
        modalMessageService = jasmine.createSpyObj('ModalMessageService', ['showMessage', 'showDecisionMessage'], {
            message$: of(null),
            decisionMessage$: of(null)
        });

        playerCreationService = jasmine.createSpyObj('PlayerCreationService', ['createPlayer']);
        routerService = jasmine.createSpyObj('Router', ['navigate']);
        refreshService = jasmine.createSpyObj('RefreshService', ['setRefreshDetector']);
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);

        avatarListService = jasmine.createSpyObj('AvatarListService', ['setSelectedAvatar', 'sendPlayerCreationClosed'], {
            selectedAvatar: of(AvatarChoice.AVATAR0)});
        
        roomSocketService = jasmine.createSpyObj('RoomSocketService', {
            listenForJoinError: of(null),
            listenForAvatarList: of([]),
            listenForAvatarSelected: of(null),
            listenForRoomJoined: of(null)
        });

        roomJoiningService = jasmine.createSpyObj('RoomJoiningService', ['isValidInput', 'doesRoomExist', 'handlePlayerCreationOpened', 'requestJoinRoom'], {
            playerToJoin: {
                playerInfo: {
                    id: '1',
                    userName: 'John Doe',
                    avatar: AvatarChoice.AVATAR0,
                    role: PlayerRole.HUMAN,
                },
                playerInGame: {
                    hp: 100,
                    isCurrentPlayer: true,
                    isFighting: false,
                    movementSpeed: 5,
                    remainingMovement: 5,
                    dice: {
                        defenseDieValue: 4,
                        attackDieValue: 6,
                    } as DiceType,
                    attack: 10,
                    defense: 5,
                    inventory: [],
                    renderInfo: {
                        spriteSheet: SpriteSheetChoice.MaleNinja,
                        currentSprite: 0,
                        offset: { x: 0, y: 0 },
                    },
                    currentPosition: { x: 0, y: 0 },
                    startPosition: { x: 0, y: 0 },
                    hasAbandonned: false,
                }
            }
        });

        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
            providers: [
                { provide: RoomJoiningService, useValue: roomJoiningService },
                { provide: RefreshService, useValue: refreshService },
                { provide: ModalMessageService, useValue: modalMessageService },
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: Router, useValue: routerService },
                { provide: PlayerCreationService, useValue: playerCreationService },
                { provide: RoomSocketService, useValue: roomSocketService},
                { provide: AvatarListService, useValue: avatarListService},
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ],            
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.playerCreationModal = {
            nativeElement: {
                open: false,
                close: jasmine.createSpy('close')
            }
        } as any;
    });

    it('should create', () => {
        console.log(roomJoiningService.playerToJoin);
        expect(component).toBeTruthy();
    });

    it('should return the correct playerToJoin', () => {
        const expectedPlayer: Player = {
            playerInfo: {
                id: '1',
                userName: 'John Doe',
                avatar: AvatarChoice.AVATAR0,
                role: PlayerRole.HUMAN,
            },
            playerInGame: {
                hp: 100,
                isCurrentPlayer: true,
                isFighting: false,
                movementSpeed: 5,
                remainingMovement: 5,
                dice: {
                    defenseDieValue: 4,
                    attackDieValue: 6,
                } as DiceType,
                attack: 10,
                defense: 5,
                inventory: [],
                renderInfo: {
                    spriteSheet: SpriteSheetChoice.MaleNinja,
                    currentSprite: 0,
                    offset: { x: 0, y: 0 },
                },
                currentPosition: { x: 0, y: 0 },
                startPosition: { x: 0, y: 0 },
                hasAbandonned: false,
            }
        };
        expect(component.playerToJoin).toEqual(expectedPlayer);
    });

    // showErrorMessage()

    it('should show an error message for invalid input', () => {
        component.userInput = "abcd";
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
        component.userInput = "1234";
        roomJoiningService.isValidInput.and.returnValue(true);
        roomJoiningService.doesRoomExist.and.returnValue(of(true));
        component.onJoinClicked();
        expect(roomJoiningService.roomCode).toBe('1234');
        expect(roomJoiningService.handlePlayerCreationOpened).toHaveBeenCalledWith('1234');
    });
    
    it('should create player and request to join the room on submit', () => {
        const mockFormData = {
            name: 'Heroic Player',
            avatarId: AvatarChoice.AVATAR0, 
            statsBonus: Statistic.ATTACK,
            dice6: Statistic.DEFENSE,
        };;
        const mockPlayer = {
            playerInfo: {
                id: '1',
                userName: 'John Doe',
                avatar: AvatarChoice.AVATAR0,
                role: PlayerRole.HUMAN,
            },
            playerInGame: {
                hp: 100,
                isCurrentPlayer: true,
                isFighting: false,
                movementSpeed: 5,
                remainingMovement: 5,
                dice: {
                    defenseDieValue: 4,
                    attackDieValue: 6,
                } as DiceType,
                attack: 10,
                defense: 5,
                inventory: [],
                renderInfo: {
                    spriteSheet: SpriteSheetChoice.MaleNinja,
                    currentSprite: 0,
                    offset: { x: 0, y: 0 },
                },
                currentPosition: { x: 0, y: 0 },
                startPosition: { x: 0, y: 0 },
                hasAbandonned: false,
            }
        };;

        playerCreationService.createPlayer.and.returnValue(mockPlayer); 

        component.onSubmit(mockFormData);

        expect(playerCreationService.createPlayer).toHaveBeenCalledWith(mockFormData, PlayerRole.HUMAN);
        expect(roomJoiningService.playerToJoin).toEqual(mockPlayer);
        expect(roomJoiningService.requestJoinRoom).toHaveBeenCalledWith(component.roomCode);
    });

    it('should send player creation closed when form is closed', () => {
        const mockRoomCode = '1234';
        roomJoiningService.roomCode = mockRoomCode;
        component.onFormClosed();
        expect(avatarListService.sendPlayerCreationClosed).toHaveBeenCalledWith(mockRoomCode);
    });

    it('should call requestJoinRoom if the modal is open', () => {
        component.playerCreationModal.nativeElement.open = true; // Simulate modal being open
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
