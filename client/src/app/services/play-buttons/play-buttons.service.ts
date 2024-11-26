import { inject, Injectable } from '@angular/core';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { ItemType } from '@common/enums/item-type.enum';

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
        this.renderingState.currentlyUsedItem = ItemType.Random;
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
