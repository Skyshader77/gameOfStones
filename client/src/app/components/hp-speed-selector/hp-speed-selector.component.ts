import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faHeart, faPlay } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-hp-speed-selector',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './hp-speed-selector.component.html',
})
export class HpSpeedSelectorComponent {
    faHeart = faHeart;
    faPlay = faPlay;
    faCircleInfo = faCircleInfo;

    placeHolder: number[];
    playerForm: FormGroup;
}
