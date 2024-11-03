import { TestBed } from '@angular/core/testing';
import { JoinPageComponent } from './join-page.component';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { PlayerRole } from '@common/constants/player.constants';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let roomJoiningService: jasmine.SpyObj<RoomJoiningService>;

    beforeEach(async () => {
        roomJoiningService = jasmine.createSpyObj('RoomJoiningService', [], {
            roomCode: '12345',
            playerToJoin: {
                playerInfo: {
                    id: '1',
                    userName: 'John Doe',
                    avatar: 0, // Assuming a valid AvatarChoice
                    role: PlayerRole.HUMAN, // Assuming a valid PlayerRole
                },
                playerInGame: {
                    hp: 100,
                    isCurrentPlayer: true,
                    isFighting: false,
                    movementSpeed: 5,
                    remainingMovement: 5,
                    dice: 1, // Assuming a valid DiceType
                    attack: 10,
                    defense: 5,
                    inventory: [],
                    renderInfo: {
                        spriteSheet: 0, // Assuming a valid SpriteSheetChoice
                        currentSprite: 0,
                        offset: { x: 0, y: 0 }, // Assuming a valid Vec2
                    },
                    currentPosition: { x: 0, y: 0 }, // Assuming a valid Vec2
                    startPosition: { x: 0, y: 0 }, // Assuming a valid Vec2
                    hasAbandonned: false,
                }
            }
        });

        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
            providers: [{ provide: RoomJoiningService, useValue: roomJoiningService }],
        }).compileComponents();

        component = TestBed.createComponent(JoinPageComponent).componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct roomCode from roomJoiningService', () => {
        expect(component.roomCode).toBe('12345');
    });

    it('should return the correct playerToJoin from roomJoiningService', () => {
        expect(component.playerToJoin).toEqual(roomJoiningService.playerToJoin);
    });
});
