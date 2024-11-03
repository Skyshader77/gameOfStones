import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { START_TURN_DELAY } from '@common/constants/gameplay.constants';
import { DoorOpeningOutput } from '@common/interfaces/map';
import { AttackResult, FightResult, FightTurnInformation } from '@common/interfaces/fight';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    hasTripped: boolean;
    private changeTurnSubscription: Subscription;
    private startTurnSubscription: Subscription;
    private doorSubscription: Subscription;
    private startFightSubscription: Subscription;
    private startFightTurnSubscription: Subscription;
    private attackSubscription: Subscription;
    private evadeSubscription: Subscription;
    private endFightSubscription: Subscription;

    private fightStateService: FightStateService = inject(FightStateService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);

    constructor(
        private socketService: SocketService,
        private playerListService: PlayerListService,
        private gameTimeService: GameTimeService,
        private router: Router,
        private gameMap: GameMapService,
    ) {}

    initialize() {
        this.startTurnSubscription = this.listenToStartTurn();
        this.changeTurnSubscription = this.listenToChangeTurn();
        this.doorSubscription = this.listenToOpenDoor();
        this.startFightSubscription = this.listenToStartFight();
        this.startFightTurnSubscription = this.listenToStartFightTurn();
        this.attackSubscription = this.listenToAttack();
        this.evadeSubscription = this.listenToEvade();
        this.endFightSubscription = this.listenToEndFight();
    }

    processMovement(destination: Vec2) {
        this.socketService.emit<Vec2>(Gateway.GAME, GameEvents.DesiredMove, destination);
    }

    listenToPlayerMove(): Observable<MovementServiceOutput> {
        return this.socketService.on<MovementServiceOutput>(Gateway.GAME, GameEvents.PlayerMove);
    }

    endTurn() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndTurn);
    }

    endAction() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndAction);
    }

    endFightAction() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndFightAction);
    }

    listenToMovementPreview(): Observable<ReachableTile[]> {
        return this.socketService.on<ReachableTile[]>(Gateway.GAME, GameEvents.MapPreview);
    }

    listenToPlayerSlip(): Subscription {
        return this.socketService.on<boolean>(Gateway.GAME, GameEvents.PlayerSlipped).subscribe((hasTripped: boolean) => {
            this.hasTripped = hasTripped;
        });
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredDoor, doorLocation);
    }

    listenToOpenDoor(): Subscription {
        return this.socketService.on<DoorOpeningOutput>(Gateway.GAME, GameEvents.PlayerDoor).subscribe((newDoorState: DoorOpeningOutput) => {
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.remainingActions--;
            }
            this.gameMap.updateDoorState(newDoorState.updatedTileTerrain, newDoorState.doorPosition);
            this.endAction();
        });
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

    sendStartGame() {
        this.socketService.emit(Gateway.GAME, GameEvents.DesireStartGame);
    }

    sendPlayerAbandon() {
        this.socketService.emit(Gateway.GAME, GameEvents.Abandoned);
    }

    listenToStartGame(): Subscription {
        return this.socketService.on<GameStartInformation>(Gateway.GAME, GameEvents.StartGame).subscribe((startInformation: GameStartInformation) => {
            this.router.navigate(['/play']);
            this.playerListService.preparePlayersForGameStart(startInformation.playerStarts);
            this.gameMap.map = startInformation.map;
        });
    }

    listenToPossiblePlayerMovement(): Observable<ReachableTile[]> {
        return this.socketService.on<ReachableTile[]>(Gateway.GAME, GameEvents.PossibleMovement);
    }

    cleanup() {
        this.changeTurnSubscription.unsubscribe();
        this.startTurnSubscription.unsubscribe();
        this.doorSubscription.unsubscribe();
        this.startFightSubscription.unsubscribe();
        this.startFightTurnSubscription.unsubscribe();
        this.attackSubscription.unsubscribe();
        this.evadeSubscription.unsubscribe();
        this.endFightSubscription.unsubscribe();
    }

    private listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            this.playerListService.updateCurrentPlayer(nextPlayerName);
            this.gameTimeService.setStartTime(START_TURN_DELAY);
        });
    }

    private listenToStartTurn(): Subscription {
        return this.socketService.on<number>(Gateway.GAME, GameEvents.StartTurn).subscribe((initialTime: number) => {
            this.gameTimeService.setStartTime(initialTime);
        });
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
            if (this.myPlayerService.isCurrentPlayer) {
                this.endAction();
            }
        });
    }
}
