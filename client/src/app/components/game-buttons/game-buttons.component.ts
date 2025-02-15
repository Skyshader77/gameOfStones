import { Component, EventEmitter, inject, Output } from '@angular/core';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
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
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private gameLogicSocketService: GameLogicSocketService = inject(GameLogicSocketService);
    private playButtonLogic: PlayButtonsService = inject(PlayButtonsService);

    get isActionDisabled(): boolean {
        return (
            !this.myPlayerService.isCurrentPlayer ||
            this.myPlayerService.isFighting ||
            this.myPlayerService.getRemainingActions() === 0 ||
            this.gameLogicSocketService.isChangingTurn
        );
    }

    get isFinishTurnDisabled(): boolean {
        return !this.myPlayerService.isCurrentPlayer || this.myPlayerService.isFighting || this.gameLogicSocketService.isChangingTurn;
    }

    onActionButtonClicked() {
        this.playButtonLogic.clickActionButton();
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
