import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCrown, faPerson, faRobot } from '@fortawesome/free-solid-svg-icons';
export interface PlayerField {
    name: string;
}
export interface MapField {
    size: string;
}
export interface GameField {
    numberPlayer: number;
}

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './game-info.component.html',
    styleUrl: './game-info.component.scss',
})
export class GameInfoComponent {
    robotIcon = faRobot;
    humanIcon = faPerson;
    crownIcon = faCrown;

    mapField: MapField = {
        size: '20 x 20',
    };

    playerField: PlayerField = {
        name: 'John Doe',
    };

    gameField: GameField = {
        numberPlayer: 6,
    };
}
