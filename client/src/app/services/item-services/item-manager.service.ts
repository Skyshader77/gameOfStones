import { Injectable } from '@angular/core';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ItemManagerService {
    inventoryFull$;
    closeItemDropModal$;

    private inventoryFullSubject = new Subject<void>();
    private closeItemDropSubject = new Subject<void>();

    constructor(
        private playerListService: PlayerListService,
        private gameMapService: GameMapService,
    ) {
        this.inventoryFull$ = this.inventoryFullSubject.asObservable();
        this.closeItemDropModal$ = this.closeItemDropSubject.asObservable();
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
    }

    handleInventoryFull() {
        this.inventoryFullSubject.next();
    }

    handleCloseItemDropModal() {
        this.closeItemDropSubject.next();
    }
}
