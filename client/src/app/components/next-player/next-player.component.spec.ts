import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { Player } from '@app/interfaces/player';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerInfo } from '@common/interfaces/player';
import { NextPlayerComponent } from './next-player.component';

describe('NextPlayerComponent', () => {
    let component: NextPlayerComponent;
    let fixture: ComponentFixture<NextPlayerComponent>;
    let mockPlayerListService: jasmine.SpyObj<PlayerListService>;
    let mockMyPlayerService: jasmine.SpyObj<MyPlayerService>;

    beforeEach(async () => {
        mockPlayerListService = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        mockMyPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName']);

        await TestBed.configureTestingModule({
            imports: [NextPlayerComponent],
            providers: [
                { provide: PlayerListService, useValue: mockPlayerListService },
                { provide: MyPlayerService, useValue: mockMyPlayerService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NextPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the current player name from MyPlayerService', () => {
        mockMyPlayerService.getUserName.and.returnValue('TestUser');
        expect(component.myName).toBe('TestUser');
        expect(mockMyPlayerService.getUserName).toHaveBeenCalled();
    });

    it('should return the next player name from PlayerListService', () => {
        mockPlayerListService.getCurrentPlayer.and.returnValue({
            playerInfo: { userName: 'NextPlayer', avatar: Avatar.MaleHealer } as PlayerInfo,
        } as Player);
        expect(component.nextPlayerName).toBe('NextPlayer');
        expect(mockPlayerListService.getCurrentPlayer).toHaveBeenCalled();
    });

    it('should return the correct avatar for the next player', () => {
        mockPlayerListService.getCurrentPlayer.and.returnValue({
            playerInfo: { userName: 'NextPlayer', avatar: Avatar.FemaleHealer } as PlayerInfo,
        } as Player);
        expect(component.nextPlayerAvatar).toBe(AVATAR_PROFILE[Avatar.FemaleHealer]);
        expect(mockPlayerListService.getCurrentPlayer).toHaveBeenCalled();
    });

    it('should return an empty string if no current player exists', () => {
        mockPlayerListService.getCurrentPlayer.and.returnValue(undefined);
        expect(component.nextPlayerAvatar).toBe('');
        expect(component.nextPlayerName).toBeUndefined();
    });
});
