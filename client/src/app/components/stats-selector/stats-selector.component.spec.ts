import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DEFAULT_INITIAL_STAT, MAX_INITIAL_STAT, STATS_ICON_SIZE } from '@app/constants/player.constants';
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

    it('should render the correct number of hpSpeed and attackDefense radio buttons', () => {
        const hpSpeedRadios = fixture.nativeElement.querySelectorAll('input[name="bonus"]');
        const attackDefenseRadios = fixture.nativeElement.querySelectorAll('input[name="d6"]');
        expect(hpSpeedRadios.length).toBe(component.hpSpeedFields.length);
        expect(attackDefenseRadios.length).toBe(component.attackDefenseFields.length);
    });

    it('should have radio buttons unchecked by default for hpSpeedControl', () => {
        expect(component.hpSpeedControl.value).toBe('');
        const radioInputs = fixture.nativeElement.querySelectorAll('input[name="bonus"]');
        radioInputs.forEach((input: HTMLInputElement) => {
            expect(input.checked).toBeFalsy();
        });
    });

    it('should have radio buttons unchecked by default for attackDefenseControl', () => {
        expect(component.attackDefenseControl.value).toBe('');
        const radioInputs = fixture.nativeElement.querySelectorAll('input[name="d6"]');
        radioInputs.forEach((input: HTMLInputElement) => {
            expect(input.checked).toBeFalsy();
        });
    });

    it('should display correct tooltip descriptions for hpSpeedFields', () => {
        const tooltips = fixture.nativeElement.querySelectorAll('.hp-speed-tooltip');
        component.hpSpeedFields.forEach((stat, index) => {
            expect(tooltips[index].getAttribute('data-tip')).toBe(stat.description);
        });
    });

    it('should display correct tooltip descriptions for attackDefenseFields', () => {
        const tooltips = fixture.nativeElement.querySelectorAll('.attack-defense-tooltip');
        component.attackDefenseFields.forEach((stat, index) => {
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

    it('should display tooltip description on hover over each icon for attackDefenseFields', () => {
        component.attackDefenseFields.forEach((stat, index) => {
            const tooltipElement = fixture.debugElement.queryAll(By.css('.attack-defense-tooltip'))[index];
            tooltipElement.triggerEventHandler('mouseenter', {});
            fixture.detectChanges();
            const tooltipDescription = tooltipElement.nativeElement.getAttribute('data-tip');
            expect(tooltipDescription).toBe(stat.description, `Tooltip description should match for ${stat.name}`);
        });
    });

    it('should initialize defaultStat, statsIconSize, and placeHolder correctly', () => {
        expect(component.defaultStat).toEqual(DEFAULT_INITIAL_STAT);
        expect(component.statsIconSize).toEqual(STATS_ICON_SIZE);
        expect(component.placeHolder.length).toEqual(MAX_INITIAL_STAT);
    });

    /* it('should display the 6-sided die icon when Attaque is selected', () => {
        component.attackDefenseControl.setValue('Attaque');
        fixture.detectChanges();

        const diceIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceIcon).toBeTruthy();
    });

    it('should display the 6-sided die icon when Défense is selected', () => {
        component.attackDefenseControl.setValue('Défense');
        fixture.detectChanges();

        const diceIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceIcon).toBeTruthy();
    });

    it('should display the correct die icons when Attaque is selected', () => {
        component.attackDefenseControl.setValue('Attaque');
        fixture.detectChanges();

        const diceSixIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceSixIcon).toBeTruthy();

        const diceFourIcon = fixture.debugElement.query(By.css('.fa-dice-four'));
        expect(diceFourIcon).toBeTruthy();
    });

    it('should display the correct die icons when Défense is selected', () => {
        component.attackDefenseControl.setValue('Défense');
        fixture.detectChanges();

        const diceSixIcon = fixture.debugElement.query(By.css('.fa-dice-six'));
        expect(diceSixIcon).toBeTruthy();

        const diceFourIcon = fixture.debugElement.query(By.css('.fa-dice-four'));
        expect(diceFourIcon).toBeTruthy();
    });
 */
    it('should render radio buttons for hpSpeedFields', () => {
        expect(component.hpSpeedFields.length).toBeGreaterThan(0);

        const radioInputs = fixture.nativeElement.querySelectorAll('input[name="bonus"]');
        expect(radioInputs.length).toBe(component.hpSpeedFields.length);
    });

    /* it('should check the Vie radio button and uncheck the Rapidité radio button', () => {
        // Initialisez le contrôle avec une valeur par défaut (assurez-vous que c'est bien 'Rapidité' ou 'Vie' selon votre besoin)
        component.hpSpeedControl.setValue('Rapidité');
        fixture.detectChanges(); // Met à jour l'affichage

        // Vérifiez que le bouton Rapidité est coché au départ
        const rapiditeRadioButton = fixture.nativeElement.querySelector('input[name="bonus"][value="Rapidité"]');
        expect(rapiditeRadioButton.checked).toBeTruthy();

        // Simulez un clic sur le bouton Vie
        const vieRadioButton = fixture.nativeElement.querySelector('input[name="bonus"][value="Vie"]');
        vieRadioButton.click();
        fixture.detectChanges(); // Met à jour l'affichage

        // Vérifiez que le bouton Vie est maintenant coché
        expect(vieRadioButton.checked).toBeTruthy();

        // Vérifiez que le bouton Rapidité n'est plus coché
        expect(rapiditeRadioButton.checked).toBeFalsy();
    });

    it('should find the Vie radio button in the DOM', () => {
        const vieRadioButton = fixture.nativeElement.querySelector('input[name="bonus"][value="Vie"]');
        expect(vieRadioButton).toBeTruthy();
    }); */

    /* it('should display exactly 6 red hearts when Vie is selected', () => {
        // Mettre à jour le contrôle avec la valeur 'Vie'
        component.hpSpeedControl.setValue('Vie');
        fixture.detectChanges(); // Mettre à jour l'affichage

        // Rechercher toutes les icônes de cœur rouges
        const heartIcons = fixture.debugElement.queryAll(By.css('ul li .fa-heart.text-red-700'));

        // Vérifier qu'il y a exactement 6 cœurs rouges
        expect(heartIcons.length).toBe(6);

        // Vérifier que chaque cœur a l'icône correcte
        heartIcons.forEach((icon) => {
            const iconInstance = icon.componentInstance;
            expect(iconInstance.icon).toBe('faHeart'); // Remplacez par la valeur appropriée de votre icône
        });
    }); 
      it('should check Vie when selected', () => {
        component.hpSpeedControl.setValue('Vie');
        fixture.detectChanges();
        const vieRadioButton = fixture.debugElement.query(By.css('input[type="radio"][value="Vie"]'));

        // Vérifiez que l'élément existe
        expect(vieRadioButton).toBeTruthy(); 

        if (vieRadioButton) {
            expect(vieRadioButton.nativeElement.checked).toBeTrue();
        }
    });
    it('should have Rapidité radio button not checked when Vie is selected', () => {
        // Mettre à jour le contrôle avec la valeur 'Vie'
        component.hpSpeedControl.setValue('Vie');
        fixture.detectChanges(); // Mettre à jour l'affichage

        // Rechercher le bouton radio Rapidité avec le sélecteur complet
        const rapiditeRadioButton = fixture.debugElement.query(By.css('div#bonus div.label input[type="radio"][name="bonus"][value="Rapidité"]'));

        // Vérifiez que l'élément existe
        expect(rapiditeRadioButton).not.toBeNull();

        // Vérifiez que le bouton radio Rapidité est décoché
        expect(rapiditeRadioButton.nativeElement.checked).toBeFalse();
    }); */
    /* Tests : 
    - vérifier les boutons radios : clique Vie -> 2 coeurs rouges en plus
                                    clique Rapidité -> 2 flèches vertes en plus                         
    - vérifier si un bouton est cliqué l'autre est décoché
    */
});
