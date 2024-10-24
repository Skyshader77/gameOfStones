import { Component } from '@angular/core';

// À RETIRER DANS LE FUTUR
export interface PlayerInfo {
    name: string;
    avatar: string;
    hp: number;
    hpMax: number;
    speed: number;
    attack: number;
    defense: number;
    d6Bonus: number;
    movementPoints: number;
    numberOfActions: number;
}
@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [],
    templateUrl: './player-info.component.html',
})
export class PlayerInfoComponent {
    // À RETIRER DANS LE FUTUR
    playerInfoField: PlayerInfo = {
        name: 'Beau Gosse',
        avatar: 'assets//avatar/goat.jpg',
        hp: 2,
        hpMax: 4,
        speed: 4,
        attack: 4,
        defense: 4,
        d6Bonus: 0,
        movementPoints: 3,
        numberOfActions: 1,
    };

    playerInfo = [
        { label: 'Nom', value: this.playerInfoField.name },
        { label: 'Vie', value: this.playerInfoField.hp + ' / ' + this.playerInfoField.hpMax },
        { label: 'Rapidité', value: this.playerInfoField.speed },
        { label: 'Attaque', value: this.playerInfoField.attack },
        { label: 'Défense', value: this.playerInfoField.defense },
        { label: 'Bonus D6', value: this.playerInfoField.d6Bonus },
        { label: 'Points déplacement', value: this.playerInfoField.movementPoints },
        { label: "Nombre d'actions", value: this.playerInfoField.numberOfActions },
    ];
}
