import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { START_TURN_DELAY } from '@common/constants/gameplay.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { GameEndInfo, TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { DoorOpeningOutput } from '@common/interfaces/map';
import { MovementServiceOutput } from '@common/interfaces/move';
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
    private playerSlipListener: Subscription;
    private closeItemDropModalListener: Subscription;
    private rendererState: RenderingStateService = inject(RenderingStateService);
    private itemManagerService: ItemManagerService = inject(ItemManagerService);
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
        this.movementListener = this.listenToTurnInfo();
        this.itemPickedUpListener = this.listenToItemPickedUp();
        this.itemDroppedListener = this.listenToItemDropped();
        this.inventoryFullListener = this.listenToInventoryFull();
        this.playerSlipListener = this.listenToPlayerSlip();
        this.closeItemDropModalListener = this.listenToCloseItemDropModal();
    }

    processMovement(destination: Vec2) {
        this.socketService.emit<Vec2>(Gateway.Game, GameEvents.DesireMove, destination);
    }

    listenToPlayerMove(): Observable<MovementServiceOutput> {
        return this.socketService.on<MovementServiceOutput>(Gateway.Game, GameEvents.PlayerMove);
    }

    endTurn() {
        this.socketService.emit(Gateway.Game, GameEvents.EndTurn);
    }

    endAction() {
        this.socketService.emit(Gateway.Game, GameEvents.EndAction);
    }

    endFightAction() {
        this.socketService.emit(Gateway.Game, GameEvents.EndFightAction);
    }

    listenToPlayerSlip(): Subscription {
        return this.socketService.on<boolean>(Gateway.Game, GameEvents.PlayerSlipped).subscribe((hasTripped: boolean) => {
            this.hasTripped = hasTripped;
        });
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.Game, GameEvents.DesireToggleDoor, doorLocation);
    }

    sendStartGame() {
        this.socketService.emit(Gateway.Game, GameEvents.DesireStartGame);
    }

    sendPlayerAbandon() {
        this.socketService.emit(Gateway.Game, GameEvents.Abandoned);
    }

    sendItemDropChoice(item: ItemType) {
        this.socketService.emit(Gateway.Game, GameEvents.DesireDropItem, item);
    }

    listenToStartGame(): Subscription {
        return this.socketService.on<GameStartInformation>(Gateway.Game, GameEvents.StartGame).subscribe((startInformation: GameStartInformation) => {
            this.router.navigate(['/play']);
            this.playerListService.preparePlayersForGameStart(startInformation.playerStarts);
            this.gameMap.map = startInformation.map;
        });
    }

    listenToLastStanding(): Observable<void> {
        return this.socketService.on<void>(Gateway.Game, GameEvents.LastStanding);
    }

    listenToEndGame(): Observable<GameEndInfo> {
        return this.socketService.on<GameEndInfo>(Gateway.Game, GameEvents.EndGame);
    }

    cleanup() {
        this.changeTurnSubscription.unsubscribe();
        this.startTurnSubscription.unsubscribe();
        this.doorSubscription.unsubscribe();
        this.movementListener.unsubscribe();
        this.itemPickedUpListener.unsubscribe();
        this.itemDroppedListener.unsubscribe();
        this.inventoryFullListener.unsubscribe();
        this.playerSlipListener.unsubscribe();
        this.closeItemDropModalListener.unsubscribe();
    }

    private listenToItemPickedUp(): Subscription {
        return this.socketService.on<ItemPickupPayload>(Gateway.Game, GameEvents.ItemPickedUp).subscribe((itemPickUpPayload: ItemPickupPayload) => {
            this.itemManagerService.handleItemPickup(itemPickUpPayload);
        });
    }

    private listenToItemDropped(): Subscription {
        return this.socketService.on<ItemDropPayload>(Gateway.Game, GameEvents.ItemDropped).subscribe((itemDropPayload: ItemDropPayload) => {
            this.itemManagerService.handleItemDrop(itemDropPayload);
        });
    }

    private listenToInventoryFull(): Subscription {
        return this.socketService.on(Gateway.Game, GameEvents.InventoryFull).subscribe(() => {
            this.itemManagerService.handleInventoryFull();
        });
    }

    private listenToCloseItemDropModal(): Subscription {
        return this.socketService.on(Gateway.Game, GameEvents.CloseItemDropModal).subscribe(() => {
            this.itemManagerService.handleCloseItemDropModal();
        });
    }

    private listenToOpenDoor(): Subscription {
        return this.socketService.on<DoorOpeningOutput>(Gateway.Game, GameEvents.ToggleDoor).subscribe((newDoorState: DoorOpeningOutput) => {
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.remainingActions--;
            }
            this.gameMap.updateDoorState(newDoorState.updatedTileTerrain, newDoorState.doorPosition);
            if (this.myPlayerService.isCurrentPlayer || this.playerListService.isCurrentPlayerAI()) this.endAction();
        });
    }

    private listenToTurnInfo(): Subscription {
        return this.socketService.on<TurnInformation>(Gateway.Game, GameEvents.TurnInfo).subscribe((turnInfo: TurnInformation) => {
            this.rendererState.playableTiles = turnInfo.reachableTiles;
            this.rendererState.actionTiles = turnInfo.actions;
            this.rendererState.displayPlayableTiles = true;
            this.rendererState.displayActions = false;
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.attributes = turnInfo.attributes;
            }
        });
    }

    private listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.Game, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            this.rendererState.displayPlayableTiles = false;
            this.rendererState.displayActions = false;
            this.playerListService.updateCurrentPlayer(nextPlayerName);
            this.isChangingTurn = true;
            this.gameTimeService.setStartTime(START_TURN_DELAY);
        });
    }

    private listenToStartTurn(): Subscription {
        return this.socketService.on<number>(Gateway.Game, GameEvents.StartTurn).subscribe((initialTime: number) => {
            this.isChangingTurn = false;
            this.gameTimeService.setStartTime(initialTime);
        });
    }
}
