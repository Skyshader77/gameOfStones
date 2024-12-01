import { inject, Injectable } from '@angular/core';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class PlayButtonsService {
    private myPlayer = inject(MyPlayerService);
    private renderingState = inject(RenderingStateService);
    private fightSocketService = inject(FightSocketService);

    clickActionButton() {
        if (!this.myPlayer.isCurrentPlayer) return;

        this.renderingState.displayActions = !this.renderingState.displayActions;
        this.renderingState.displayItemTiles = false;
        this.renderingState.displayPlayableTiles = true;
        this.renderingState.currentlySelectedItem = null;
    }

    clickAttackButton() {
        if (this.myPlayer.isCurrentFighter) {
            this.fightSocketService.sendDesiredAttack();
        }
    }

    clickEvadeButton() {
        if (this.myPlayer.isCurrentFighter) {
            this.fightSocketService.sendDesiredEvade();
        }
    }
}
