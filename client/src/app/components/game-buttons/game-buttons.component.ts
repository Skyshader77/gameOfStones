import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';

@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './game-buttons.component.html',
})
export class GameButtonsComponent {
    @Output() abandon = new EventEmitter<void>();

    buttonIcon = BUTTONS_ICONS;
    private rendererState = inject(RenderingStateService);

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

    onActionButtonClicked() {
        this.playButtonLogic.clickActionButton();
    }

    onAttackButtonClicked() {
        this.playButtonLogic.clickAttackButton();
    }

    onEvadeButtonClicked() {
        this.playButtonLogic.clickEvadeButton();
    }

    onAbandonGameClicked() {
        this.abandon.emit();
    }

    onFinishTurnClicked() {
        this.gameLogicSocketService.endTurn();
        this.rendererState.actionTiles = [];
        this.rendererState.arrowHead = null;
        this.rendererState.playableTiles = [];
    }
}
