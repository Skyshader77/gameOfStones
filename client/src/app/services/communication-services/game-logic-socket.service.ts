import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { START_TURN_DELAY } from '@common/constants/gameplay.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { GameEndOutput } from '@common/interfaces/game-gateway-outputs';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { Item } from '@common/interfaces/item';
import { DoorOpeningOutput } from '@common/interfaces/map';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    hasTripped: boolean;
    isChangingTurn: boolean = true;
    private changeTurnSubscription: Subscription;
    private startTurnSubscription: Subscription;
    private doorSubscription: Subscription;
    private movementListener: Subscription;
    private itemPickedUpListener: Subscription;
    private itemDroppedListener: Subscription;
    private inventoryFullListener: Subscription;
    private rendererState: RenderingStateService = inject(RenderingStateService);

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
        this.movementListener = this.listenToPossiblePlayerMovement();
        this.itemPickedUpListener = this.listenToItemPickedUp();
        this.itemDroppedListener = this.listenToItemDropped();
        this.inventoryFullListener = this.listenToInventoryFull();
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

    listenToPlayerSlip(): Subscription {
        return this.socketService.on<boolean>(Gateway.GAME, GameEvents.PlayerSlipped).subscribe((hasTripped: boolean) => {
            this.hasTripped = hasTripped;
        });
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredDoor, doorLocation);
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

    listenToEndGame(): Observable<GameEndOutput> {
        return this.socketService.on<GameEndOutput>(Gateway.GAME, GameEvents.EndGame);
    }

    cleanup() {
        this.changeTurnSubscription.unsubscribe();
        this.startTurnSubscription.unsubscribe();
        this.doorSubscription.unsubscribe();
        this.movementListener.unsubscribe();
        this.itemPickedUpListener.unsubscribe();
        this.itemDroppedListener.unsubscribe();
        this.inventoryFullListener.unsubscribe();
    }

    private listenToItemPickedUp(): Subscription {
        return this.socketService.on<Item[]>(Gateway.GAME, GameEvents.ItemPickedUp).subscribe();
    }

    private listenToItemDropped(): Subscription {
        return this.socketService.on<Item[]>(Gateway.GAME, GameEvents.ItemDropped).subscribe();
    }

    private listenToInventoryFull(): Subscription {
        return this.socketService.on<Item[]>(Gateway.GAME, GameEvents.InventoryFull).subscribe();
    }

    private listenToOpenDoor(): Subscription {
        return this.socketService.on<DoorOpeningOutput>(Gateway.GAME, GameEvents.PlayerDoor).subscribe((newDoorState: DoorOpeningOutput) => {
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.remainingActions--;
            }
            this.gameMap.updateDoorState(newDoorState.updatedTileTerrain, newDoorState.doorPosition);
            this.endAction();
        });
    }

    private listenToPossiblePlayerMovement(): Subscription {
        return this.socketService.on<ReachableTile[]>(Gateway.GAME, GameEvents.PossibleMovement).subscribe((possibleMoves: ReachableTile[]) => {
            this.rendererState.playableTiles = possibleMoves;
        });
    }

    private listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            this.rendererState.playableTiles = [];
            this.rendererState.actionTiles = [];
            this.playerListService.updateCurrentPlayer(nextPlayerName);
            this.isChangingTurn = true;
            this.gameTimeService.setStartTime(START_TURN_DELAY);
        });
    }

    private listenToStartTurn(): Subscription {
        return this.socketService.on<number>(Gateway.GAME, GameEvents.StartTurn).subscribe((initialTime: number) => {
            this.isChangingTurn = false;
            this.gameTimeService.setStartTime(initialTime);
        });
    }
}
