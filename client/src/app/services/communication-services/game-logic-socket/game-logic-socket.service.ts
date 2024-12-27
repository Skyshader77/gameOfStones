import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Pages } from '@app/interfaces/pages';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { START_TURN_DELAY } from '@common/constants/gameplay.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { GameEndInfo, TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { HammerPayload, Item, ItemDropPayload, ItemLostPayload, ItemPickupPayload, ItemUsedPayload } from '@common/interfaces/item';
import { DoorOpeningOutput } from '@common/interfaces/map';
import { MovementServiceOutput } from '@common/interfaces/move';
import { DeadPlayerPayload } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Observable, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    hasTripped: boolean;
    isChangingTurn: boolean = true;
    private changeTurnSubscription: Subscription;
    private startTurnSubscription: Subscription;
    private doorSubscription: Subscription;
    private turnInfoListener: Subscription;
    private itemPickedUpListener: Subscription;
    private itemDroppedListener: Subscription;
    private inventoryFullListener: Subscription;
    private closeItemDropModalListener: Subscription;
    private bombUsedListener: Subscription;
    private playerDeadListener: Subscription;
    private tilesExplodedListener:Subscription;
    private itemPlacedListener: Subscription;
    private itemLostListener: Subscription;

    private rendererState: RenderingStateService = inject(RenderingStateService);
    private itemManagerService: ItemManagerService = inject(ItemManagerService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private socketService: SocketService = inject(SocketService);
    private playerListService: PlayerListService = inject(PlayerListService);
    private gameTimeService: GameTimeService = inject(GameTimeService);
    private audioService: AudioService = inject(AudioService);
    private router: Router = inject(Router);
    private gameMap: GameMapService = inject(GameMapService);

    initialize() {
        this.startTurnSubscription = this.listenToStartTurn();
        this.changeTurnSubscription = this.listenToChangeTurn();
        this.doorSubscription = this.listenToOpenDoor();
        this.turnInfoListener = this.listenToTurnInfo();
        this.itemPickedUpListener = this.listenToItemPickedUp();
        this.itemDroppedListener = this.listenToItemDropped();
        this.inventoryFullListener = this.listenToInventoryFull();
        this.closeItemDropModalListener = this.listenToCloseItemDropModal();
        this.bombUsedListener = this.listenToBombUsed();
        this.playerDeadListener = this.listenToPlayerDead();
        this.itemPlacedListener = this.listenToItemPlaced();
        this.itemLostListener = this.listenToItemLost();
        this.tilesExplodedListener = this.listenToTilesExploded();
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
        if (this.myPlayerService.isCurrentPlayer || this.playerListService.isCurrentPlayerAI()) {
            this.socketService.emit(Gateway.Game, GameEvents.EndAction);
        }
    }

    endFightAction() {
        this.socketService.emit(Gateway.Game, GameEvents.EndFightAction);
    }

    listenToPlayerSlip(): Observable<string> {
        return this.socketService.on<string>(Gateway.Game, GameEvents.PlayerSlipped);
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.Game, GameEvents.DesireToggleDoor, doorLocation);
    }

    sendItemUsed(itemUsedPayload: ItemUsedPayload) {
        this.socketService.emit(Gateway.Game, GameEvents.DesireUseItem, itemUsedPayload);
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
            this.router.navigate([`/${Pages.Play}`]);
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

    listenToHammerUsed(): Observable<HammerPayload> {
        return this.socketService.on<HammerPayload>(Gateway.Game, GameEvents.HammerUsed);
    }

    cleanup() {
        this.changeTurnSubscription.unsubscribe();
        this.startTurnSubscription.unsubscribe();
        this.doorSubscription.unsubscribe();
        this.turnInfoListener.unsubscribe();
        this.itemPickedUpListener.unsubscribe();
        this.itemDroppedListener.unsubscribe();
        this.inventoryFullListener.unsubscribe();
        this.closeItemDropModalListener.unsubscribe();
        this.bombUsedListener.unsubscribe();
        this.playerDeadListener.unsubscribe();
        this.itemPlacedListener.unsubscribe();
        this.itemLostListener.unsubscribe();
        this.tilesExplodedListener.unsubscribe();
    }

    private listenToBombUsed(): Subscription {
        return this.socketService.on(Gateway.Game, GameEvents.BombUsed).subscribe(() => {
            this.rendererState.updateUseItem();
            this.audioService.playSfx(Sfx.Bomb);
        });
    }

    private listenToItemPlaced(): Subscription {
        return this.socketService.on<Item>(Gateway.Game, GameEvents.ItemPlaced).subscribe((item: Item) => {
            this.itemManagerService.handleItemPlaced(item);
        });
    }

    private listenToItemLost(): Subscription {
        return this.socketService.on<ItemLostPayload>(Gateway.Game, GameEvents.ItemLost).subscribe((itemLostPayload: ItemLostPayload) => {
            this.itemManagerService.handleItemLost(itemLostPayload);
        });
    }

    private listenToPlayerDead(): Subscription {
        return this.socketService.on<DeadPlayerPayload[]>(Gateway.Game, GameEvents.PlayerDead).subscribe((deadPlayers: DeadPlayerPayload[]) => {
            this.rendererState.deadPlayers = deadPlayers;
        });
    }

    private listenToTilesExploded(): Subscription {
        return this.socketService.on<Vec2[]>(Gateway.Game, GameEvents.TilesBlownUp).subscribe((blownUpTiles: Vec2[]) => {
            this.gameMap.updateBlownUpTiles(blownUpTiles);
        });
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
            this.audioService.playSfx(newDoorState.updatedTileTerrain === TileTerrain.ClosedDoor ? Sfx.CloseDoor : Sfx.OpenDoor);
            this.endAction();
        });
    }

    private listenToTurnInfo(): Subscription {
        return this.socketService.on<TurnInformation>(Gateway.Game, GameEvents.TurnInfo).subscribe((turnInfo: TurnInformation) => {
            this.rendererState.updateTurnInfo(turnInfo);
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (currentPlayer) {
                currentPlayer.playerInGame.attributes = turnInfo.attributes;
            }
        });
    }

    private listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.Game, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            this.rendererState.updateChangeTurn();
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
