import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarListComponent } from './avatar-list.component';

describe('AvatarListComponent', () => {
    let component: AvatarListComponent;
    let fixture: ComponentFixture<AvatarListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /* Tests : 
    
        Vérification du clic sur la photo dans le dropdown :
        - Assurez-vous que le clic sur chaque option du dropdown déclenche correctement l'événement et remplace la photo affichée.
    
        Vérification de la mise à jour de l'interface utilisateur :
        - Après avoir cliqué sur une nouvelle photo dans le dropdown, vérifiez que l'image affichée est bien mise à jour sans délai perceptible.
    
        Vérification de la persistance du changement :
        - Si le changement de photo est censé être sauvegardé (dans un état local ou à distance), vérifiez que la nouvelle photo sélectionnée est bien persistée et reste sélectionnée après un rafraîchissement de la page ou navigation vers une autre page.
    
        Test de l'intégration avec le formulaire (si applicable) :
        - Si la sélection de la photo est une partie d'un formulaire, vérifiez que la photo sélectionnée est correctement soumise avec les autres données.
    */
});
