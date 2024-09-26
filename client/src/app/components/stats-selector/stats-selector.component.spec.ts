import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSelectorComponent } from './stats-selector.component';

describe('StatsSelectorComponent', () => {
    let component: StatsSelectorComponent;
    let fixture: ComponentFixture<StatsSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsSelectorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /* Tests : 
    - vérifier valeur par défaut des radios boutons décocher
    - vérifier quand on hover le i que la description apparait

    - vérifier les boutons radios : clique Vie -> 2 coeurs rouges en plus
                                    clique Rapidité -> 2 flèches vertes en plus
                                    
    - vérifier que si on bouton est cliqué l'autre est décocher
    
    - vérifier les boutons radios : clique Attaque -> d6 apparait à coté et d4 apparait pour Défense
                                    clique Défense -> d6 apparait à coté et d4 apparait pour Attaque

    - vérifier que si on bouton est cliqué l'autre est décocher
    */
});
