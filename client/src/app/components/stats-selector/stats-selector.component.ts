import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ATTACK_DEFENSE_FIELDS, FORM_ICONS, HP_SPEED_FIELDS, STATS_ICON_SIZE } from '@app/constants/player.constants';
import { DEFAULT_INITIAL_STAT, MAX_INITIAL_STAT } from '@common/constants/player-creation.constants';

import { StatsFormField } from '@app/interfaces/stats';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-stats-selector',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './stats-selector.component.html',
})
export class StatsSelectorComponent {
    @Input() hpSpeedControl: FormControl;
    @Input() attackDefenseControl: FormControl;

    formIcon = FORM_ICONS;
    defaultStat = DEFAULT_INITIAL_STAT;
    statsIconSize = STATS_ICON_SIZE;

    hpSpeedFields: StatsFormField[] = HP_SPEED_FIELDS;
    attackDefenseFields: StatsFormField[] = ATTACK_DEFENSE_FIELDS;
    placeHolder = Array.from({ length: MAX_INITIAL_STAT }, (_, i) => i);
}
