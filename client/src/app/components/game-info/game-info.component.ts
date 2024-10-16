import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCrown, faPerson, faRobot } from '@fortawesome/free-solid-svg-icons';

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
}
