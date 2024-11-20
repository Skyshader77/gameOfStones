import { inject, Injectable } from '@angular/core';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { AttackResult, FightResult, FightTurnInformation } from '@common/interfaces/fight';
import { Subscription } from 'rxjs';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { FightState } from '@app/interfaces/fight-info';
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
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private gameLogicSocketService: GameLogicSocketService = inject(GameLogicSocketService);
    private renderStateService = inject(RenderingStateService);

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

    sendDesiredFight(opponentName: string) {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireFight, opponentName);
    }

    sendDesiredAttack() {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireAttack);
    }

    sendDesiredEvade() {
        this.socketService.emit(Gateway.Fight, GameEvents.DesireEvade);
    }

    endFightAction() {
        this.socketService.emit(Gateway.Fight, GameEvents.EndFightAction);
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
            this.myPlayerService.isFighting = fightOrder.includes(this.myPlayerService.getUserName());
            if (this.myPlayerService.isFighting) {
                this.renderStateService.isInFightTransition = true;
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
            if (this.myPlayerService.isCurrentFighter) {
                this.endFightAction();
            }
            if (this.fightStateService.attackResult?.hasDealtDamage) {
                this.fightStateService.fightState = FightState.Attack;
            }
        });
    }

    private listenToEvade(): Subscription {
        return this.socketService.on<boolean>(Gateway.Fight, GameEvents.FighterEvade).subscribe((evasionSuccessful) => {
            this.fightStateService.processEvasion(evasionSuccessful);
            if (evasionSuccessful) {
                this.fightStateService.fightState = FightState.Evade;
            } else {
                if (this.myPlayerService.isCurrentFighter) {
                    this.endFightAction();
                }
            }
        });
    }

    private listenToEndFight(): Subscription {
        return this.socketService.on<FightResult>(Gateway.Fight, GameEvents.FightEnd).subscribe((result) => {
            this.fightStateService.processEndFight(result);
            this.myPlayerService.isCurrentFighter = false;
            this.myPlayerService.isFighting = false;
            this.renderStateService.fightStarted = false;
            if (this.myPlayerService.isCurrentPlayer) {
                this.gameLogicSocketService.endAction();
            }
        });
    }
}
