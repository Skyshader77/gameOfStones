import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerInfoField } from '@app/pages/play-page/play-page.component';

@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-info.component.html',
    styleUrls: [],
})
export class PlayerInfoComponent {
    @Input() playerInfoField!: PlayerInfoField; // Dans un service

    get playerInfo() {
        return [
            { label: 'Nom', value: this.playerInfoField.name },
            { label: 'Vie', value: `${this.playerInfoField.hp} / ${this.playerInfoField.hpMax}` },
            { label: 'Rapidité', value: this.playerInfoField.speed },
            { label: 'Attaque', value: this.playerInfoField.attack },
            { label: 'Défense', value: this.playerInfoField.defense },
            { label: 'Bonus D6', value: this.playerInfoField.d6Bonus },
            { label: 'Points déplacement', value: this.playerInfoField.movementPoints },
            { label: "Nombre d'actions", value: this.playerInfoField.numberOfActions },
        ];
    }
}
