import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFlag, faHand, faHandPointer, faPersonBurst, faPersonRunning } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './game-buttons.component.html',
    styleUrl: './game-buttons.component.scss',
})
export class GameButtonsComponent {
    handIcon = faHand;
    handPointerIcon = faHandPointer;
    flagIcon = faFlag;
    personBurstIcon = faPersonBurst;
    personRunningIcon = faPersonRunning;
}
