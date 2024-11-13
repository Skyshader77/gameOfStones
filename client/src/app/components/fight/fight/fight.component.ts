import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering.service';

@Component({
    selector: 'app-fight',
    standalone: true,
    templateUrl: './fight.component.html',
})
export class FightComponent implements AfterViewInit {
    @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

    rasterSize = MAP_PIXEL_DIMENSION;
    private fightRenderer = inject(FightRenderingService);
    private gameLoopService = inject(GameLoopService);

    ngAfterViewInit(): void {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.gameLoopService.startGameLoop();
        this.fightRenderer.setContext(ctx);
        this.fightRenderer.renderInitialFight();
    }
}
