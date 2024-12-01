import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DICE_ROLL_TIME, MOCK_DICE_ROLL_4, MOCK_DICE_ROLL_5, MOCK_DICE_ROLL_6, START_DICE_NUMBER } from '@app/constants/tests.constants';
import { DiceComponent } from './dice.component';

describe('DiceComponent', () => {
    let component: DiceComponent;
    let fixture: ComponentFixture<DiceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DiceComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DiceComponent);
        component = fixture.componentInstance;
        component.diceNumber = START_DICE_NUMBER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start with the initial dice number', () => {
        expect(component.diceNumber).toBe(START_DICE_NUMBER);
    });

    it('should set isRolling to true when rolling the dice', () => {
        component.rollDice(MOCK_DICE_ROLL_5);
        expect(component.isRolling).toBeTrue();
    });

    it('should update the dice number after rolling', () => {
        const newRoll = MOCK_DICE_ROLL_5;
        component.rollDice(newRoll);
        expect(component.diceNumber).toBe(newRoll);
    });

    it('should set isRolling to false after DICE_ROLL_TIME', fakeAsync(() => {
        component.rollDice(MOCK_DICE_ROLL_4);
        expect(component.isRolling).toBeTrue();
        tick(DICE_ROLL_TIME);
        expect(component.isRolling).toBeFalse();
    }));

    it('should update the dice number and reset isRolling correctly', fakeAsync(() => {
        component.rollDice(MOCK_DICE_ROLL_6);
        expect(component.diceNumber).toBe(MOCK_DICE_ROLL_6);
        expect(component.isRolling).toBeTrue();
        tick(DICE_ROLL_TIME);
        expect(component.isRolling).toBeFalse();
    }));
});
