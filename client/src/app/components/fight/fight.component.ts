import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DiceComponent } from '@app/components/dice/dice.component';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { FightState } from '@app/interfaces/fight-info';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering/fight-rendering.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-fight',
    standalone: true,
    templateUrl: './fight.component.html',
    imports: [DiceComponent, CommonModule],
})
export class FightComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('diceCompMyPlayer') diceCompMyPlayer: DiceComponent;
    @ViewChild('diceCompOpponent') diceCompOpponent: DiceComponent;

    myPlayerRoll: number;
    opponentRoll: number;
    rasterSize = MAP_PIXEL_DIMENSION;
    private destroy$ = new Subject<void>();

    private fightRenderer = inject(FightRenderingService);
    private gameLoopService = inject(GameLoopService);
    private fightSocketService = inject(FightSocketService);
    private myPlayerService = inject(MyPlayerService);
    private fightStateService = inject(FightStateService);
    private cdr = inject(ChangeDetectorRef);

    get isEvadeDisabled(): boolean {
        return !this.myPlayerService.isCurrentFighter || this.fightStateService.evasionsLeft(this.myPlayerService.getUserName()) === 0;
    }

    ngOnInit() {
        this.handleUpdateRolls();
    }

    handleUpdateRolls() {
        this.fightStateService.attackResult$?.pipe(takeUntil(this.destroy$)).subscribe((result) => {
            if (result) {
                this.myPlayerRoll = this.myPlayerService.isCurrentFighter ? result.attackRoll : result.defenseRoll;
                this.opponentRoll = !this.myPlayerService.isCurrentFighter ? result.attackRoll : result.defenseRoll;
                this.diceCompMyPlayer?.rollDice(this.myPlayerRoll);
                this.diceCompOpponent?.rollDice(this.opponentRoll);
                this.cdr.detectChanges();
            }
        });
    }

    ngAfterViewInit(): void {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.fightStateService.fightState = FightState.Start;
        this.fightRenderer.setContext(ctx);
        this.fightRenderer.setPlayers();
        this.fightRenderer.renderInitialFight();
        this.gameLoopService.startGameLoop();

        this.cdr.detectChanges();
    }

    startAttack() {
        if (this.fightStateService.fightState !== FightState.Idle || this.diceCompMyPlayer.isRolling) {
            return;
        }
        this.fightSocketService.sendDesiredAttack();
    }

    areButtonsRendered(): boolean {
        return this.fightStateService.fightState !== FightState.Start && this.fightStateService.fightState !== FightState.Evade;
    }

    isMyPlayerAttacking() {
        return this.myPlayerService.isCurrentFighter;
    }

    startEvade() {
        if (this.fightStateService.fightState === FightState.Idle && !this.diceCompMyPlayer.isRolling) {
            this.fightSocketService.sendDesiredEvade();
        }
    }

    ngOnDestroy() {
        this.gameLoopService.stopGameLoop();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
