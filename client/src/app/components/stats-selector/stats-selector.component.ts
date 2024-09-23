import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DEFAULT_INITIAL_STAT, MAX_INITIAL_STAT } from '@app/constants/player.constants';
import { StatsFormField } from '@app/interfaces/stats';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-selector',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
    templateUrl: './stats-selector.component.html',
})
export class StatsSelectorComponent {
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

    defaultStat = DEFAULT_INITIAL_STAT;

    hpSpeedFields: StatsFormField[] = [
        {
            name: 'Vie',
            description: 'Les points de vie sont utiles pour survivre durant un combat',
            icon: faHeart,
            color: 'red-700',
        },
        {
            name: 'Rapidité',
            description: "La rapidité impacte la vitesse des coups portés lors d'un combat",
            icon: faPlay,
            color: 'green-700',
        },
    ];

    attackDefenseFields: StatsFormField[] = [
        {
            name: 'Attaque',
            description: "Les points d'attaque indiquent les dégâts pouvant être infligés à vos adversaires",
            icon: faHandFist,
            color: 'yellow-500',
        },
        {
            name: 'Défense',
            description: 'Les points de défense informe sur la capacité à encaisser les coups de vos adversaires',
            icon: faShieldHalved,
            color: 'blue-700',
        },
    ];
    placeHolder: number[];

    constructor() {
        this.placeHolder = Array.from({ length: MAX_INITIAL_STAT }, (_, i) => i);
    }
}
