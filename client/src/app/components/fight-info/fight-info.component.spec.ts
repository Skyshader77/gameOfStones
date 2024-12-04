import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_ATTACK_RESULT, MOCK_FIGHT } from '@app/constants/tests.constants';
import { FightInfoComponent } from './fight-info.component';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';

describe('FightInfoComponent', () => {
    let component: FightInfoComponent;
    let fixture: ComponentFixture<FightInfoComponent>;
    let mockFightStateService: jasmine.SpyObj<FightStateService>;

    beforeEach(async () => {
        mockFightStateService = jasmine.createSpyObj('FightStateService', [], {
            currentFight: MOCK_FIGHT,
            attackResult: MOCK_ATTACK_RESULT,
        });

        await TestBed.configureTestingModule({
            imports: [FightInfoComponent],
            providers: [{ provide: FightStateService, useValue: mockFightStateService }],
        }).compileComponents();

        fixture = TestBed.createComponent(FightInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate fightInfo with fighters and evasions', () => {
        const fightInfo = component.fightInfo;
        expect(fightInfo.length).toBe(2);
        expect(fightInfo[0].fighterName).toBe('Player 1');
        expect(fightInfo[0].evasions).toBe(MOCK_FIGHT.numbEvasionsLeft[0]);
        expect(fightInfo[1].fighterName).toBe('Player 2');
        expect(fightInfo[1].evasions).toBe(MOCK_FIGHT.numbEvasionsLeft[1]);
    });

    it('should populate diceRolls with attack and defense rolls', () => {
        const diceRolls = component.diceRolls;
        expect(diceRolls.length).toBe(2);
        expect(diceRolls[0].fighterRole).toBe('Attaquant ');
        expect(diceRolls[0].roll).toBe(MOCK_ATTACK_RESULT.attackRoll);
        expect(diceRolls[1].fighterRole).toBe('Défenseur ');
        expect(diceRolls[1].roll).toBe(MOCK_ATTACK_RESULT.defenseRoll);
    });
});
