import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ATTACK_DEFENSE_FIELDS, DEFAULT_INITIAL_STAT, HP_SPEED_FIELDS, MAX_INITIAL_STAT, STATS_ICON_SIZE } from '@app/constants/player.constants';
import { StatsFormField } from '@app/interfaces/stats';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-selector',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './stats-selector.component.html',
})
export class StatsSelectorComponent {
    @Input() hpSpeedControl: FormControl;
    @Input() attackDefenseControl: FormControl;

    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faCircleInfo = faCircleInfo;
    faSquare = faSquare;

    defaultStat = DEFAULT_INITIAL_STAT;
    statsIconSize = STATS_ICON_SIZE;

    hpSpeedFields: StatsFormField[] = HP_SPEED_FIELDS;
    attackDefenseFields: StatsFormField[] = ATTACK_DEFENSE_FIELDS;
    placeHolder: number[];

    constructor() {
        this.placeHolder = Array.from({ length: MAX_INITIAL_STAT }, (_, i) => i);
    }
}
