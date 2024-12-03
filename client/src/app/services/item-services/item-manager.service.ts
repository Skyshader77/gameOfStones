import { Injectable } from '@angular/core';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { Item, ItemDropPayload, ItemLostPayload, ItemPickupPayload } from '@common/interfaces/item';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ItemManagerService {
    inventoryFull$: Observable<void>;
    closeItemDropModal$: Observable<void>;
    private pendingPickup: ItemType | null = null;
    private _hasToDropItem: boolean = false;

    private inventoryFullSubject = new Subject<void>();
    private closeItemDropSubject = new Subject<void>();

    constructor(
        private playerListService: PlayerListService,
        private gameMapService: GameMapService,
        private audioService: AudioService,
    ) {
        this.inventoryFull$ = this.inventoryFullSubject.asObservable();
        this.closeItemDropModal$ = this.closeItemDropSubject.asObservable();
    }

    get hasToDropItem() {
        return this._hasToDropItem;
    }

    set hasToDropItem(hasToDropItem: boolean) {
        this._hasToDropItem = hasToDropItem;
    }

    handleItemPlaced(item: Item) {
        this.gameMapService.updateItemsAfterPlaced(item);
    }

    handleItemLost(itemLostPayload: ItemLostPayload) {
        const player = this.playerListService.getPlayerByName(itemLostPayload.playerName);
        if (!player) return;
        player.playerInGame.inventory = JSON.parse(JSON.stringify(itemLostPayload.newInventory));
    }

    handleItemPickup(itemPickUpPayload: ItemPickupPayload) {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer || !itemPickUpPayload.newInventory) return;
        currentPlayer.playerInGame.inventory = JSON.parse(JSON.stringify(itemPickUpPayload.newInventory));
        this.pendingPickup = itemPickUpPayload.itemType;
    }

    isWaitingForPickup() {
        return this.pendingPickup !== null;
    }

    pickupItem() {
        if (this.isWaitingForPickup()) {
            this.gameMapService.updateItemsAfterPickup(this.pendingPickup || ItemType.Random);
            this.audioService.playSfx(Sfx.ItemPickedUp);
            this.pendingPickup = null;
        }
    }

    handleItemDrop(itemDropPayload: ItemDropPayload) {
        this.handleItemLost({ playerName: itemDropPayload.playerName, newInventory: itemDropPayload.newInventory });
        this.gameMapService.updateItemsAfterPlaced(itemDropPayload.item);
    }

    handleInventoryFull() {
        this.hasToDropItem = true;
        this.inventoryFullSubject.next();
    }

    handleCloseItemDropModal() {
        this.closeItemDropSubject.next();
    }
}
