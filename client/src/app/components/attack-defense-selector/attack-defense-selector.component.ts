import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-attack-defense-selector',
    standalone: true,
    imports: [FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './attack-defense-selector.component.html',
})
export class AttackDefenseSelectorComponent {
    @Input() placeHolder: number[] = [];
    @Input() attackDefenseControl: FormControl;

    faCircleInfo = faCircleInfo;
    faHandFist = faHandFist;
    faShieldHalved = faShieldHalved;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faSquare = faSquare;
}
