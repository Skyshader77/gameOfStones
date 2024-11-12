import { Injectable } from '@angular/core';
import { ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { Subject } from 'rxjs';
import { GameMapService } from '../room-services/game-map.service';
import { MyPlayerService } from '../room-services/my-player.service';
import { PlayerListService } from '../room-services/player-list.service';

@Injectable({
    providedIn: 'root',
})
export class ItemManagerService {
    private inventoryFullSubject = new Subject<void>();
    private closeItemDropSubject = new Subject<void>();
    inventoryFull$ = this.inventoryFullSubject.asObservable();
    closeItemDropModal$ = this.closeItemDropSubject.asObservable();
    constructor(
        private myPlayerService: MyPlayerService,
        private playerListService: PlayerListService,
        private gameMapService: GameMapService,
    ) { }

    handleItemPickup(itemPickUpPayload: ItemPickupPayload) {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer) return;
        currentPlayer.playerInGame.inventory = JSON.parse(JSON.stringify(itemPickUpPayload.newInventory));
        if (currentPlayer.playerInfo.userName === this.myPlayerService.getUserName()) {
            this.myPlayerService.setInventory(itemPickUpPayload.newInventory);
        }
        this.gameMapService.updateItemsAfterPickup(itemPickUpPayload.itemType);
    }

    handleItemDrop(itemDropPayload: ItemDropPayload) {
        const player = this.playerListService.getPlayerByName(itemDropPayload.playerName);
        if (!player) return;
        player.playerInGame.inventory = JSON.parse(JSON.stringify(itemDropPayload.newInventory));
        if (player.playerInfo.userName === this.myPlayerService.getUserName()) {
            this.myPlayerService.setInventory(itemDropPayload.newInventory);
        }
        this.gameMapService.updateItemsAfterDrop(itemDropPayload.item);
    }

    handleInventoryFull() {
        this.inventoryFullSubject.next();
    }

    handleCloseItemDropModal() {
        this.closeItemDropSubject.next();
    }
}
