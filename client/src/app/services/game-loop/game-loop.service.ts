import { Injectable } from '@angular/core';
import { FRAME_LENGTH } from '@app/constants/rendering.constants';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { MovementService } from '@app/services/movement-service/movement.service';

@Injectable({
    providedIn: 'root',
})
export class GameLoopService {
    private interval: number | undefined = undefined;

    constructor(
        private renderingService: RenderingService,
        private movementService: MovementService,
    ) {}

    startGameLoop() {
        this.interval = window.setInterval(() => {
            this.movementService.update();
            this.renderingService.renderAll();
        }, FRAME_LENGTH);
    }

    stopGameLoop() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
