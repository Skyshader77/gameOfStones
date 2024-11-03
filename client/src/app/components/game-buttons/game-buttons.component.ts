import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { PlayerFightInfo } from '@app/pages/play-page/play-page.component';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './game-buttons.component.html',
})
export class GameButtonsComponent {
    @Input() isInCombat!: boolean; // Dans un service
    @Input() fightField!: PlayerFightInfo;

    @Output() abandon = new EventEmitter<void>();

    buttonIcon = BUTTONS_ICONS;

    constructor(
        public gameLogicSocketService: GameLogicSocketService,
        public playButtonLogic: PlayButtonsService,
    ) {}

    actionButton() {
        this.playButtonLogic.clickActionButton();
    }

    attackButton() {
        this.playButtonLogic.clickAttackButton();
    }

    evadeButton() {
        this.playButtonLogic.clickEvadeButton();
    }

    abandonGame() {
        this.abandon.emit();
    }

    finishTurn() {
        this.gameLogicSocketService.endTurn();
    }
}
