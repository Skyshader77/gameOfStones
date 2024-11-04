import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVATAR_FOLDER } from '@app/constants/player.constants';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { Subscription } from 'rxjs';
import { GamePlayerListComponent } from './game-player-list.component';

describe('GamePlayerListComponent', () => {
    let component: GamePlayerListComponent;
    let fixture: ComponentFixture<GamePlayerListComponent>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;

    beforeEach(async () => {
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', [
            'listenPlayerListUpdated',
            'listenPlayerAdded',
            'listenPlayerRemoved',
            'listenRoomClosed',
        ]);
        Object.defineProperty(playerListServiceMock, 'currentPlayerName', { value: 'testPlayer', writable: true });

        playerListServiceMock.listenPlayerListUpdated.and.returnValue(new Subscription());
        playerListServiceMock.listenPlayerAdded.and.returnValue(new Subscription());
        playerListServiceMock.listenPlayerRemoved.and.returnValue(new Subscription());
        playerListServiceMock.listenRoomClosed.and.returnValue(new Subscription());

        await TestBed.configureTestingModule({
            imports: [GamePlayerListComponent],
            providers: [
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: AVATAR_FOLDER, useValue: 'assets/avatars/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct avatar image path for a given avatar', () => {
        const femaleNinjaImagePath = component.getAvatarImage(Avatar.FemaleNinja);
        expect(femaleNinjaImagePath).toBe(AVATAR_FOLDER + 'ninjaF.jpeg');
    });

    it('should return true if playerName matches currentPlayerName', () => {
        expect(component.isCurrentPlayer('testPlayer')).toBe(true);
    });

    it('should return false if playerName does not match currentPlayerName', () => {
        expect(component.isCurrentPlayer('otherPlayer')).toBe(false);
    });
});
