import { Component } from '@angular/core';
// À RETIRER DANS LE FUTUR
export interface PlayerFightInfo {
    diceResult: number;
    numberEscapesRemaining: number;
}
@Component({
    selector: 'app-fight-info',
    standalone: true,
    imports: [],
    templateUrl: './fight-info.component.html',
})
export class FightInfoComponent {
    // À RETIRER DANS LE FUTUR
    fightField: PlayerFightInfo = {
        diceResult: 0,
        numberEscapesRemaining: 3,
    };

    fightInfo = [
        { label: 'Résultat de dé', value: this.fightField.diceResult },
        { label: 'Évasion restante', value: this.fightField.numberEscapesRemaining },
    ];
}
