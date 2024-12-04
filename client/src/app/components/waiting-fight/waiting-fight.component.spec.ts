import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { Player } from '@app/interfaces/player';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { Avatar } from '@common/enums/avatar.enum';
import { Fight } from '@common/interfaces/fight';
import { PlayerInfo } from '@common/interfaces/player';
import { WaitingFightComponent } from './waiting-fight.component';

describe('WaitingFightComponent', () => {
    let component: WaitingFightComponent;
    let fixture: ComponentFixture<WaitingFightComponent>;
    let mockFightStateService: jasmine.SpyObj<FightStateService>;

    beforeEach(async () => {
        mockFightStateService = jasmine.createSpyObj('FightStateService', ['']);
        await TestBed.configureTestingModule({
            imports: [WaitingFightComponent],
            providers: [{ provide: FightStateService, useValue: mockFightStateService }],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingFightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return an empty array for fighters if there is no current fight', () => {
        mockFightStateService.currentFight = null as unknown as Fight;
        expect(component.fighters).toEqual([]);
    });

    it('should return correct fighter names if fighters are present', () => {
        mockFightStateService.currentFight = {
            fighters: [
                { playerInfo: { userName: 'Player1', avatar: Avatar.FemaleHealer } as PlayerInfo } as Player,
                { playerInfo: { userName: 'Player2', avatar: Avatar.MaleHealer } as PlayerInfo } as Player,
            ],
        } as unknown as Fight;
        expect(component.fighterNames).toEqual({
            player1: 'Player1',
            player2: 'Player2',
        });
    });

    it('should return correct fighter avatars if fighters are present', () => {
        mockFightStateService.currentFight = {
            fighters: [
                { playerInfo: { userName: 'Player1', avatar: Avatar.FemaleHealer } as PlayerInfo } as Player,
                { playerInfo: { userName: 'Player2', avatar: Avatar.MaleHealer } as PlayerInfo } as Player,
            ],
        } as unknown as Fight;
        expect(component.fighterAvatars).toEqual({
            player1: AVATAR_PROFILE[Avatar.FemaleHealer],
            player2: AVATAR_PROFILE[Avatar.MaleHealer],
        });
    });
});
