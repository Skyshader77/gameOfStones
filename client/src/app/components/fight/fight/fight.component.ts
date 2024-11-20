import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { DiceComponent } from '@app/components/dice/dice/dice.component';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { FightState } from '@app/interfaces/fight-info';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Component({
    selector: 'app-fight',
    standalone: true,
    templateUrl: './fight.component.html',
    imports: [DiceComponent, CommonModule],
})
export class FightComponent implements AfterViewInit {
    @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('diceCompMyPlayer') diceCompMyPlayer: DiceComponent;
    @ViewChild('diceCompOpponent') diceCompOpponent: DiceComponent;

    rasterSize = MAP_PIXEL_DIMENSION;
    private fightRenderer = inject(FightRenderingService);
    private gameLoopService = inject(GameLoopService);
    private fightSocketService = inject(FightSocketService);
    private myPlayerService = inject(MyPlayerService);
    private fightStateService = inject(FightStateService);
    private cdr = inject(ChangeDetectorRef);

    ngAfterViewInit(): void {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.fightRenderer.setContext(ctx);
        this.fightRenderer.renderInitialFight();
        this.gameLoopService.startGameLoop();
        this.fightRenderer.setPlayers();

        this.cdr.detectChanges();
    }

    startAttack() {
        if (this.fightStateService.fightState !== FightState.Idle || this.diceCompMyPlayer.isRolling) {
            return;
        }
        this.fightSocketService.sendDesiredAttack();
        this.diceCompMyPlayer.rollDice(1);
        this.diceCompOpponent.rollDice(2);
    }

    isButtonsRender(): boolean {
        if (this.fightStateService.fightState === FightState.Evade) {
            return false;
        }
        if (!this.myPlayerService.isCurrentFighter) {
            return false;
        }
        return this.fightStateService.fightState !== FightState.Start;
    }

    startEvade() {
        if (this.fightStateService.fightState !== FightState.Idle || this.diceCompMyPlayer.isRolling) {
            return;
        }
        this.fightStateService.fightState = FightState.Evade;
    }
}
