import { inject, Injectable } from '@angular/core';
import { FightState } from '@app/interfaces/fight-info';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { AttackResult, FightResult, FightTurnInformation } from '@common/interfaces/fight';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { AudioService } from '@app/services/audio/audio.service';
import { Sfx } from '@app/interfaces/sfx';
import { END_TIMER } from '@app/constants/fight-rendering.constants';
@Injectable({
    providedIn: 'root',
})
export class FightSocketService {
    private startFightSubscription: Subscription;
    private startFightTurnSubscription: Subscription;
    private attackSubscription: Subscription;
    private evadeSubscription: Subscription;
    private endFightSubscription: Subscription;

    private socketService: SocketService = inject(SocketService);
    private playerListService: PlayerListService = inject(PlayerListService);
    private fightStateService: FightStateService = inject(FightStateService);
    private renderStateService: RenderingStateService = inject(RenderingStateService);
    private audioService: AudioService = inject(AudioService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private gameLogicSocketService: GameLogicSocketService = inject(GameLogicSocketService);

    initialize() {
        this.startFightSubscription = this.listenToStartFight();
        this.startFightTurnSubscription = this.listenToStartFightTurn();
        this.attackSubscription = this.listenToAttack();
        this.evadeSubscription = this.listenToEvade();
        this.endFightSubscription = this.listenToEndFight();
    }

    sendDesiredFightTimer() {
        this.socketService.emit(Gateway.Fight, GameEvents.DesiredFightTimer);
    }

    sendDesiredFight(opponentPosition: Vec2) {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireFight, opponentPosition);
    }

    sendDesiredAttack() {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireAttack);
    }

    sendDesiredEvade() {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireEvade);
    }

    endFightAction() {
        if (this.myPlayerService.isCurrentFighter || this.fightStateService.isAIInFight()) {
            this.socketService.emit(Gateway.Fight, GameEvents.EndFightAction);
        }
    }

    cleanup() {
        this.startFightSubscription.unsubscribe();
        this.startFightTurnSubscription.unsubscribe();
        this.attackSubscription.unsubscribe();
        this.evadeSubscription.unsubscribe();
        this.endFightSubscription.unsubscribe();
    }

    private listenToStartFight(): Subscription {
        return this.socketService.on<string[]>(Gateway.Fight, GameEvents.StartFight).subscribe((fightOrder: string[]) => {
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.remainingActions--;
            }
            this.fightStateService.initializeFight(fightOrder);
            this.myPlayerService.isCurrentFighter = fightOrder[0] === this.myPlayerService.getUserName();
            this.myPlayerService.isFighting = fightOrder.includes(this.myPlayerService.getUserName());
            this.renderStateService.displayActions = false;
            this.renderStateService.displayPlayableTiles = false;
            if (this.myPlayerService.isFighting) {
                this.renderStateService.isInFightTransition = true;
                this.audioService.playSfx(Sfx.FightStart);
            }
        });
    }

    private listenToStartFightTurn(): Subscription {
        return this.socketService.on<FightTurnInformation>(Gateway.Fight, GameEvents.StartFightTurn).subscribe((turnInfo) => {
            this.myPlayerService.isCurrentFighter = this.myPlayerService.getUserName() === turnInfo.currentFighter;
            this.fightStateService.initializeFightTurn(turnInfo.currentFighter);
        });
    }

    private listenToAttack(): Subscription {
        return this.socketService.on<AttackResult>(Gateway.Fight, GameEvents.FighterAttack).subscribe((attackResult) => {
            this.fightStateService.processAttack(attackResult);
            if (this.fightStateService.attackResult?.hasDealtDamage) {
                this.fightStateService.fightState = FightState.Attack;
                this.audioService.playRandomSfx([Sfx.FighterAttack1, Sfx.FighterAttack2]);
            } else {
                this.endFightAction();
            }
        });
    }

    private listenToEvade(): Subscription {
        return this.socketService.on<boolean>(Gateway.Fight, GameEvents.FighterEvade).subscribe((evasionSuccessful) => {
            this.fightStateService.processEvasion(evasionSuccessful);
            if (evasionSuccessful) {
                this.fightStateService.fightState = FightState.Evade;
                this.audioService.playSfx(Sfx.FighterEvade);
            } else {
                this.endFightAction();
            }
        });
    }

    private listenToEndFight(): Subscription {
        return this.socketService.on<FightResult>(Gateway.Fight, GameEvents.FightEnd).subscribe((result) => {
            const isAIInFight = this.fightStateService.isAIInFight();
            if (!result.loser) {
                return;
            }
            const loser = this.playerListService.getPlayerByName(result.loser);
            if (!loser) {
                return;
            }
            this.fightStateService.deadPlayer = loser;
            this.fightStateService.fightState = FightState.Death;
            setTimeout(() => {
                this.fightStateService.processEndFight(result);
                this.myPlayerService.isCurrentFighter = false;
                this.myPlayerService.isFighting = false;
                this.renderStateService.fightStarted = false;
                if (this.myPlayerService.isCurrentPlayer || isAIInFight) {
                    this.gameLogicSocketService.endAction();
                }
            }, END_TIMER);
        });
    }
}
