import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faHeart, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-hp-speed-selector',
    standalone: true,
    imports: [FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './hp-speed-selector.component.html',
})
export class HpSpeedSelectorComponent {
    @Input() placeHolder: number[] = [];
    @Input() hpSpeedControl: FormControl;

    faHeart = faHeart;
    faPlay = faPlay;
    faCircleInfo = faCircleInfo;
}
