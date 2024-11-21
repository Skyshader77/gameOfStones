import { Component, EventEmitter, inject, Output } from '@angular/core';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './game-buttons.component.html',
})
export class GameButtonsComponent {
    @Output() abandon = new EventEmitter<void>();

    buttonIcon = BUTTONS_ICONS;
    private rendererState = inject(RenderingStateService);

    constructor(
        private myPlayerService: MyPlayerService,
        private fighterStateService: FightStateService,
        private gameLogicSocketService: GameLogicSocketService,
        private playButtonLogic: PlayButtonsService,
    ) {}

    get isActionDisabled(): boolean {
        return (
            !this.myPlayerService.isCurrentPlayer ||
            this.myPlayerService.isFighting ||
            this.myPlayerService.getRemainingActions() === 0 ||
            this.gameLogicSocketService.isChangingTurn
        );
    }

    get isAttackDisabled(): boolean {
        return !this.myPlayerService.isCurrentFighter;
    }

    get isEvadeDisabled(): boolean {
        return !this.myPlayerService.isCurrentFighter || this.fighterStateService.evasionsLeft(this.myPlayerService.getUserName()) === 0;
    }

    get isFinishTurnDisabled(): boolean {
        return !this.myPlayerService.isCurrentPlayer || this.myPlayerService.isFighting || this.gameLogicSocketService.isChangingTurn;
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
        this.rendererState.arrowHead = null;
        this.rendererState.displayPlayableTiles = false;
        this.rendererState.displayActions = false;
    }
}
