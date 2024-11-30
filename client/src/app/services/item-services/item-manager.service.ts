import { Injectable } from '@angular/core';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { Observable, Subject } from 'rxjs';
import { GameMapService } from '@app/services/states/game-map/game-map.service';

@Injectable({
    providedIn: 'root',
})
export class ItemManagerService {
    inventoryFull$: Observable<void>;
    closeItemDropModal$: Observable<void>;

    private _hasToDropItem: boolean = false;
    private inventoryFullSubject = new Subject<void>();
    private closeItemDropSubject = new Subject<void>();

    constructor(
        private playerListService: PlayerListService,
        private gameMapService: GameMapService,
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

    handleItemPickup(itemPickUpPayload: ItemPickupPayload) {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer || !itemPickUpPayload.newInventory) return;
        currentPlayer.playerInGame.inventory = JSON.parse(JSON.stringify(itemPickUpPayload.newInventory));
        this.gameMapService.updateItemsAfterPickup(itemPickUpPayload.itemType);
    }

    handleItemDrop(itemDropPayload: ItemDropPayload) {
        const player = this.playerListService.getPlayerByName(itemDropPayload.playerName);
        if (!player) return;
        player.playerInGame.inventory = JSON.parse(JSON.stringify(itemDropPayload.newInventory));
        this.gameMapService.updateItemsAfterDrop(itemDropPayload.item);
        console.log(this.gameMapService.map.placedItems.length);
    }

    handleInventoryFull() {
        this.hasToDropItem = true;
        this.inventoryFullSubject.next();
    }

    handleCloseItemDropModal() {
        this.closeItemDropSubject.next();
    }
}
