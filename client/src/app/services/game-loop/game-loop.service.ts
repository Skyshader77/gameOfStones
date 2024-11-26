import { Injectable } from '@angular/core';
import { FRAME_LENGTH } from '@app/constants/rendering.constants';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class GameLoopService {
    private interval: number | undefined = undefined;

    constructor(
        private renderingService: RenderingService,
        private fightRenderingService: FightRenderingService,
        private movementService: MovementService,
        private renderingStateService: RenderingStateService,
    ) {}

    startGameLoop() {
        this.interval = window.setInterval(() => {
            if (this.renderingStateService.fightStarted) {
                this.fightRenderingService.renderFight();
            } else {
                this.movementService.update();
                this.renderingService.renderAll();
            }
        }, FRAME_LENGTH);
    }

    stopGameLoop() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
