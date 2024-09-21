import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

/**********************************À COMPLÉTER *******************************************/

@Component({
    selector: 'app-attack-defense-selector',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './attack-defense-selector.component.html',
})
export class AttackDefenseSelectorComponent {
    faCircleInfo = faCircleInfo;
    faHandFist = faHandFist;
    faShieldHalved = faShieldHalved;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faSquare = faSquare;

    placeHolder: number[];
    playerForm: FormGroup;
}
