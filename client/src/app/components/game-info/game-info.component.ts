import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// À RETIRER DANS LE FUTUR
export interface PlayerField {
    name: string;
    avatar: string;
} // À RETIRER DANS LE FUTUR
export interface MapField {
    size: string;
} // À RETIRER DANS LE FUTUR
export interface GameField {
    numberPlayer: number;
}

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './game-info.component.html',
})
export class GameInfoComponent {
    // À RETIRER DANS LE FUTUR
    mapField: MapField = { size: '20 x 20' };
    // À RETIRER DANS LE FUTUR
    playerField: PlayerField = { name: 'John Doe', avatar: 'assets/avatar/goat.jpg' };
    // À RETIRER DANS LE FUTUR
    gameField: GameField = { numberPlayer: 6 };
}
