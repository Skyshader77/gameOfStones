import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFlag, faHand, faHandPointer, faPersonBurst, faPersonRunning } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './game-buttons.component.html',
    styleUrl: './game-buttons.component.scss',
})
export class GameButtonsComponent {
    constructor(
        public gameLogicSocketService: GameLogicSocketService,
    ) {}

    @Output() abandon = new EventEmitter<void>();

    handIcon = faHand;
    handPointerIcon = faHandPointer;
    flagIcon = faFlag;
    personBurstIcon = faPersonBurst;
    personRunningIcon = faPersonRunning;

    isInCombat = false;
    isModalOpen = false;

    abandonGame() {
        this.abandon.emit();
    }

    finishTurn() {
        this.gameLogicSocketService.endTurn();
    }
}
