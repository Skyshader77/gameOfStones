import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DEFAULT_INITIAL_STAT, MAX_INITIAL_STAT } from '@app/constants/player.constants';
import { Statistic } from '@app/interfaces/stats';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StatsSelectorComponent } from './stats-selector.component';

describe('StatsSelectorComponent', () => {
    let component: StatsSelectorComponent;
    let fixture: ComponentFixture<StatsSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsSelectorComponent, ReactiveFormsModule, FontAwesomeModule],
        }).compileComponents();
        fixture = TestBed.createComponent(StatsSelectorComponent);
        component = fixture.componentInstance;
        component.hpSpeedControl = new FormControl('');
        component.attackDefenseControl = new FormControl('');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create the component with default values', () => {
        expect(component).toBeTruthy();
        expect(component.defaultStat).toBe(DEFAULT_INITIAL_STAT);
        expect(component.hpSpeedFields.length).toBeGreaterThan(0);
        expect(component.attackDefenseFields.length).toBeGreaterThan(0);
    });

    it('should render the correct number of hpSpeed and attackDefense radio buttons', () => {
        const hpSpeedRadios = fixture.nativeElement.querySelectorAll('input[name="bonus"]');
        const attackDefenseRadios = fixture.nativeElement.querySelectorAll('input[name="d6"]');
        expect(hpSpeedRadios.length).toBe(component.hpSpeedFields.length);
        expect(attackDefenseRadios.length).toBe(component.attackDefenseFields.length);
    });

    it('should count default color heart icons for hpSpeedFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.hp-speed-icons li .text-red-700'));
        expect(selectedIcons.length).toBe(DEFAULT_INITIAL_STAT);
    });

    it('should count default color speed icons for hpSpeedFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.hp-speed-icons li .text-green-700'));
        expect(selectedIcons.length).toBe(DEFAULT_INITIAL_STAT);
    });

    it('should count number of icons for hpSpeedFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.hp-speed-icons li'));
        expect(selectedIcons.length).toBe(component.hpSpeedFields.length * MAX_INITIAL_STAT);
    });

    it('should display correct tooltip descriptions for hpSpeedFields', () => {
        const tooltips = fixture.nativeElement.querySelectorAll('.hp-speed-tooltip');
        component.hpSpeedFields.forEach((stat, index) => {
            expect(tooltips[index].getAttribute('data-tip')).toBe(stat.description);
        });
    });

    it('should display tooltip description on hover over each icon for hpSpeedFields', () => {
        component.hpSpeedFields.forEach((stat, index) => {
            const tooltipElement = fixture.debugElement.queryAll(By.css('.hp-speed-tooltip'))[index];
            tooltipElement.triggerEventHandler('mouseenter', {});
            fixture.detectChanges();

            const tooltipDescription = tooltipElement.nativeElement.getAttribute('data-tip');
            expect(tooltipDescription).toBe(stat.description, `Tooltip description should match for ${stat.name}`);
        });
    });

    it('should have radio buttons unchecked by default for hpSpeedControl', () => {
        expect(component.hpSpeedControl.value).toBe('');
        const radioInputs = fixture.nativeElement.querySelectorAll('input[name="bonus"]');
        radioInputs.forEach((input: HTMLInputElement) => {
            expect(input.checked).toBeFalsy();
        });
    });

    it('should set hpSpeedControl to "hp" when "Vie" button is clicked', () => {
        const hpRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.HP));
        expect(hpRadioButton).toBeTruthy();

        if (hpRadioButton) {
            hpRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.hpSpeedControl.value).toBe(Statistic.HP);
        }
    });

    it('should set hpSpeedControl to "speed" when "Rapidité" button is clicked', () => {
        const speedRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.SPEED));
        expect(speedRadioButton).toBeTruthy();

        if (speedRadioButton) {
            speedRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.hpSpeedControl.value).toBe(Statistic.SPEED);
        }
    });

    it('should verify when the "Vie" radio button is checked that the "Rapidité" radio button is unchecked', () => {
        const hpRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.HP));
        expect(hpRadioButton).toBeTruthy();

        const speedRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.SPEED));
        expect(speedRadioButton).toBeTruthy();

        if (hpRadioButton && speedRadioButton) {
            hpRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.hpSpeedControl.value).toBe(Statistic.HP);
            expect(hpRadioButton.nativeElement.checked).toBeTruthy();
            expect(speedRadioButton.nativeElement.checked).toBeFalsy();
        }
    });

    it('should verify when the "Rapidité" radio button is checked that the "Vie" radio button is unchecked', () => {
        const speedRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.SPEED));
        expect(speedRadioButton).toBeTruthy();

        const hpRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.HP));
        expect(hpRadioButton).toBeTruthy();

        if (speedRadioButton && hpRadioButton) {
            speedRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.hpSpeedControl.value).toBe(Statistic.SPEED);
            expect(speedRadioButton.nativeElement.checked).toBeTruthy();
            expect(hpRadioButton.nativeElement.checked).toBeFalsy();
        }
    });

    it('should count default color attack icons for attackDefenseFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.attack-defense-icons li .text-yellow-500'));
        expect(selectedIcons.length).toBe(DEFAULT_INITIAL_STAT);
    });

    it('should count default color defense icons for attackDefenseFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.attack-defense-icons li .text-blue-700'));
        expect(selectedIcons.length).toBe(DEFAULT_INITIAL_STAT);
    });

    it('should count number of icons for attackDefenseFields', () => {
        const selectedIcons = fixture.debugElement.queryAll(By.css('.attack-defense-icons li'));
        expect(selectedIcons.length).toBe(component.hpSpeedFields.length * MAX_INITIAL_STAT);
    });

    it('should display correct tooltip descriptions for attackDefenseFields', () => {
        const tooltips = fixture.nativeElement.querySelectorAll('.attack-defense-tooltip');
        component.attackDefenseFields.forEach((stat, index) => {
            expect(tooltips[index].getAttribute('data-tip')).toBe(stat.description);
        });
    });

    it('should display tooltip description on hover over each icon for attackDefenseFields', () => {
        component.attackDefenseFields.forEach((stat, index) => {
            const tooltipElement = fixture.debugElement.queryAll(By.css('.attack-defense-tooltip'))[index];
            tooltipElement.triggerEventHandler('mouseenter', {});
            fixture.detectChanges();

            const tooltipDescription = tooltipElement.nativeElement.getAttribute('data-tip');
            expect(tooltipDescription).toBe(stat.description, `Tooltip description should match for ${stat.name}`);
        });
    });

    it('should have radio buttons unchecked by default for attackDefenseControl', () => {
        expect(component.attackDefenseControl.value).toBe('');
        const radioInputs = fixture.nativeElement.querySelectorAll('input[name="d6"]');
        radioInputs.forEach((input: HTMLInputElement) => {
            expect(input.checked).toBeFalsy();
        });
    });

    it('should display the D6 icon when attack radio button is selected', () => {
        const attackFieldValue = component.attackDefenseFields[0].value;
        component.attackDefenseControl.setValue(attackFieldValue);
        fixture.detectChanges();

        const diceSixIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceSixIcon).toBeTruthy();
    });

    it('should display the D4 icon when defense radio button is not selected', () => {
        const attackFieldValue = component.attackDefenseFields[0].value;
        component.attackDefenseControl.setValue(attackFieldValue);
        fixture.detectChanges();

        const diceFourIcon = fixture.debugElement.query(By.css('.fa-dice-four'));
        expect(diceFourIcon).toBeTruthy();
    });

    it('should display the D6 icon when defense radio button is selected', () => {
        const defenseFieldValue = component.attackDefenseFields[1].value;
        component.attackDefenseControl.setValue(defenseFieldValue);
        fixture.detectChanges();

        const diceSixIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceSixIcon).toBeTruthy();
    });

    it('should display the D4 icon when attack radio button is not selected', () => {
        const defenseFieldValue = component.attackDefenseFields[1].value;
        component.attackDefenseControl.setValue(defenseFieldValue);
        fixture.detectChanges();

        const diceFourIcon = fixture.debugElement.query(By.css('.fa-dice-four'));
        expect(diceFourIcon).toBeTruthy();
    });

    it('should set attackDefenseControl to "attack" when "Attaque" button is clicked', () => {
        const attackRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.ATTACK));
        expect(attackRadioButton).toBeTruthy();

        if (attackRadioButton) {
            attackRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.attackDefenseControl.value).toBe(Statistic.ATTACK);
        }
    });

    it('should set attackDefenseControl to "defense" when "Défense" button is clicked', () => {
        const defenseRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.DEFENSE));
        expect(defenseRadioButton).toBeTruthy();

        if (defenseRadioButton) {
            defenseRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.attackDefenseControl.value).toBe(Statistic.DEFENSE);
        }
    });

    it('should verify when the "Attaque" radio button is checked that the "Défense" radio button is unchecked', () => {
        const attackRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.ATTACK));
        expect(attackRadioButton).toBeTruthy();

        const defenseRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.DEFENSE));
        expect(defenseRadioButton).toBeTruthy();

        if (attackRadioButton && defenseRadioButton) {
            attackRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.attackDefenseControl.value).toBe(Statistic.ATTACK);
            expect(attackRadioButton.nativeElement.checked).toBeTruthy();
            expect(defenseRadioButton.nativeElement.checked).toBeFalsy();
        }
    });

    it('should verify when the "Défense" radio button is checked that the "Attaque" radio button is unchecked', () => {
        const defenseRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.DEFENSE));
        expect(defenseRadioButton).toBeTruthy();

        const attackRadioButton = fixture.debugElement.query(By.css('#stat-' + Statistic.ATTACK));
        expect(attackRadioButton).toBeTruthy();

        if (defenseRadioButton && attackRadioButton) {
            defenseRadioButton.nativeElement.click();
            fixture.detectChanges();
            expect(component.attackDefenseControl.value).toBe(Statistic.DEFENSE);
            expect(defenseRadioButton.nativeElement.checked).toBeTruthy();
            expect(attackRadioButton.nativeElement.checked).toBeFalsy();
        }
    });
});
