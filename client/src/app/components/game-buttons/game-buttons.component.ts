import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { PlayerFightInfo } from '@app/pages/play-page/play-page.component';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerListService } from '@app/services/room-services/player-list.service';

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
        private myPlayerService: MyPlayerService,
        private fighterStateService: FightStateService,
        private playerListService: PlayerListService,
        public gameLogicSocketService: GameLogicSocketService,
        public playButtonLogic: PlayButtonsService,
    ) {}

    get isCurrentPlayer(): boolean {
        return this.myPlayerService.isCurrentPlayer;
    }

    get isCurrentFighter(): boolean {
        return this.myPlayerService.isCurrentFighter;
    }

    get isFighting(): boolean {
        return this.myPlayerService.isFighting;
    }

    get hasEvasionsLeft(): boolean {
        return this.fighterStateService.evasionsLeft(this.myPlayerService.getUserName()) > 0;
    }

    get hasActionsLeft(): boolean {
        return this.playerListService.actionsLeft() > 0;
    }

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
