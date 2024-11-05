import { inject, Injectable } from '@angular/core';
import { AttackResult, FightResult, FightTurnInformation } from '@common/interfaces/fight';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Subscription } from 'rxjs';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
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
    private gameTimeService: GameTimeService = inject(GameTimeService);

    initialize() {
        this.startFightSubscription = this.listenToStartFight();
        this.startFightTurnSubscription = this.listenToStartFightTurn();
        this.attackSubscription = this.listenToAttack();
        this.evadeSubscription = this.listenToEvade();
        this.endFightSubscription = this.listenToEndFight();
    }

    sendDesiredFight(opponentName: string) {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredFight, opponentName);
    }

    sendDesiredAttack() {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredAttack);
    }

    sendDesiredEvade() {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredEvade);
    }

    endFightAction() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndFightAction);
    }

    cleanup() {
        this.startFightSubscription.unsubscribe();
        this.startFightTurnSubscription.unsubscribe();
        this.attackSubscription.unsubscribe();
        this.evadeSubscription.unsubscribe();
        this.endFightSubscription.unsubscribe();
    }

    private listenToStartFight(): Subscription {
        return this.socketService.on<string[]>(Gateway.GAME, GameEvents.StartFight).subscribe((fightOrder: string[]) => {
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.remainingActions--;
            }
            this.fightStateService.initializeFight(fightOrder);
            this.myPlayerService.isFighting = fightOrder.includes(this.myPlayerService.getUserName());
        });
    }

    private listenToStartFightTurn(): Subscription {
        return this.socketService.on<FightTurnInformation>(Gateway.GAME, GameEvents.StartFightTurn).subscribe((turnInfo) => {
            this.gameTimeService.setStartTime(turnInfo.turnTime);
            this.myPlayerService.isCurrentFighter = this.myPlayerService.getUserName() === turnInfo.currentFighter;
            this.fightStateService.initializeFightTurn(turnInfo.currentFighter);
        });
    }

    private listenToAttack(): Subscription {
        return this.socketService.on<AttackResult>(Gateway.GAME, GameEvents.FighterAttack).subscribe((attackResult) => {
            this.fightStateService.processAttack(attackResult);
            if (this.myPlayerService.isCurrentFighter) {
                this.endFightAction();
            }
        });
    }

    private listenToEvade(): Subscription {
        return this.socketService.on<boolean>(Gateway.GAME, GameEvents.FighterEvade).subscribe((evasionSuccessful) => {
            this.fightStateService.processEvasion(evasionSuccessful);
            if (this.myPlayerService.isCurrentFighter) {
                this.endFightAction();
            }
        });
    }

    private listenToEndFight(): Subscription {
        return this.socketService.on<FightResult>(Gateway.GAME, GameEvents.FightEnd).subscribe((result) => {
            this.fightStateService.processEndFight(result);
            this.myPlayerService.isCurrentFighter = false;
            this.myPlayerService.isFighting = false;
            if (this.myPlayerService.isCurrentPlayer) {
                this.gameLogicSocketService.endAction();
            }
        });
    }
}
