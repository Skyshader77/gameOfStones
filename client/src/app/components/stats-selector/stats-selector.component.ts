import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-selector',
    standalone: true,
    imports: [FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './stats-selector.component.html',
})
export class StatsSelectorComponent {
    @Input() placeHolder: number[] = [];
    @Input() hpSpeedControl: FormControl;
    @Input() attackDefenseControl: FormControl;

    faHeart = faHeart;
    faPlay = faPlay;
    faHandFist = faHandFist;
    faShieldHalved = faShieldHalved;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faCircleInfo = faCircleInfo;
    faSquare = faSquare;
}
