import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { PlayerListComponent } from './player-list.component';

describe('PlayersListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;
    let myPlayerServiceMock: jasmine.SpyObj<MyPlayerService>;

    beforeEach(async () => {
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['initialize', 'cleanup', 'askPlayerRemovalConfirmation']);
        myPlayerServiceMock = jasmine.createSpyObj('MyPlayerService', ['getUserName', 'isOrganizer']);

        playerListServiceMock.playerList = [MOCK_PLAYERS[2], MOCK_PLAYERS[0]];

        myPlayerServiceMock.getUserName.and.returnValue('Player1');
        myPlayerServiceMock.isOrganizer.and.returnValue(true);

        await TestBed.configureTestingModule({
            imports: [PlayerListComponent],
            providers: [
                { provide: PlayerListService, useValue: playerListServiceMock },
                { provide: MyPlayerService, useValue: myPlayerServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct player list from playerList getter', () => {
        expect(component.playerList).toEqual(playerListServiceMock.playerList);
    });

    it('should return true if the given name matches the current player name in isMyName', () => {
        expect(component.isMyName('Player1')).toBeTrue();
        expect(component.isMyName('Player2')).toBeFalse();
    });

    it('should return true if the player can be kicked in canKickPlayer', () => {
        expect(component.canKickPlayer(MOCK_PLAYERS[2])).toBeTrue();
    });

    it('should return false if the player is an organizer in canKickPlayer', () => {
        expect(component.canKickPlayer(MOCK_PLAYERS[0])).toBeFalse();
    });

    it('should call askPlayerRemovalConfirmation when onKick is triggered', () => {
        const playerName = 'Player3';
        component.onKick(playerName);
        expect(playerListServiceMock.askPlayerRemovalConfirmation).toHaveBeenCalledWith(playerName);
    });

    it('should call initialize on ngOnInit', () => {
        component.ngOnInit();
        expect(playerListServiceMock.initialize).toHaveBeenCalled();
    });

    it('should call cleanup on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(playerListServiceMock.cleanup).toHaveBeenCalled();
    });
});
