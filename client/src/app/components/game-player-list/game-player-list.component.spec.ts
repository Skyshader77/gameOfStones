import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { MOCK_GOD_NAME, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { GamePlayerListComponent } from './game-player-list.component';

describe('GamePlayerListComponent', () => {
    let component: GamePlayerListComponent;
    let fixture: ComponentFixture<GamePlayerListComponent>;
    let playerListServiceMock: jasmine.SpyObj<PlayerListService>;

    beforeEach(async () => {
        playerListServiceMock = jasmine.createSpyObj('PlayerListService', ['initialize', 'cleanup', 'hasFlag']);
        Object.defineProperty(playerListServiceMock, 'currentPlayerName', { value: MOCK_GOD_NAME, writable: true });

        await TestBed.configureTestingModule({
            imports: [GamePlayerListComponent],
            providers: [{ provide: PlayerListService, useValue: playerListServiceMock }],
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
        expect(femaleNinjaImagePath).toBe(AVATAR_PROFILE[Avatar.FemaleNinja]);
    });

    it('should return true if playerName matches currentPlayerName', () => {
        expect(component.isCurrentPlayer(MOCK_GOD_NAME)).toBe(true);
    });

    it('should return false if playerName does not match currentPlayerName', () => {
        expect(component.isCurrentPlayer(MOCK_PLAYERS[0].playerInfo.userName)).toBe(false);
    });

    it('should call hasFlag and return true if the player has a flag', () => {
        const mockPlayer = MOCK_PLAYERS[0];
        playerListServiceMock.hasFlag.and.returnValue(true);

        const result = component.hasFlag(mockPlayer);

        expect(playerListServiceMock.hasFlag).toHaveBeenCalledWith(mockPlayer);
        expect(result).toBe(true);
    });

    it('should call hasFlag and return false if the player does not have a flag', () => {
        const mockPlayer = MOCK_PLAYERS[0];
        playerListServiceMock.hasFlag.and.returnValue(false);

        const result = component.hasFlag(mockPlayer);

        expect(playerListServiceMock.hasFlag).toHaveBeenCalledWith(mockPlayer);
        expect(result).toBe(false);
    });
});
