import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerFightInfo } from '@app/pages/play-page/play-page.component';

@Component({
    selector: 'app-fight-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fight-info.component.html',
})
export class FightInfoComponent {
    @Input() fightField!: PlayerFightInfo;

    get fightInfo() {
        return [
            { label: 'Résultat de dé', value: this.fightField.diceResult },
            { label: 'Évasion restante', value: this.fightField.numberEscapesRemaining },
        ];
    }
}
