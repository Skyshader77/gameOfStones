import { Injectable } from '@angular/core';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { BombResult, ItemDropPayload, ItemPickupPayload } from '@common/interfaces/item';
import { Observable, Subject } from 'rxjs';

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
        console.log(itemPickUpPayload.newInventory);
        currentPlayer.playerInGame.inventory = JSON.parse(JSON.stringify(itemPickUpPayload.newInventory));
        this.gameMapService.updateItemsAfterPickup(itemPickUpPayload.itemType);
    }

    handleItemDrop(itemDropPayload: ItemDropPayload) {
        const player = this.playerListService.getPlayerByName(itemDropPayload.playerName);
        if (!player) return;
        player.playerInGame.inventory = JSON.parse(JSON.stringify(itemDropPayload.newInventory));
        this.gameMapService.updateItemsAfterDrop(itemDropPayload.item);
    }

    handleBombUsed(bombResult: BombResult[]) {
        if (!bombResult) return;

        this.playerListService.playerList = this.playerListService.playerList.map((listPlayer) => {
            const matchingResult = bombResult.find((result) => result.player.playerInfo.userName === listPlayer.playerInfo.userName);
            if (matchingResult) {
                return {
                    ...listPlayer,
                    playerInGame: {
                        ...listPlayer.playerInGame,
                        currentPosition: { x: matchingResult.respawnPosition.x, y: matchingResult.respawnPosition.y },
                    },
                };
            }
            return listPlayer;
        });
    }

    handleInventoryFull() {
        this.hasToDropItem = true;
        this.inventoryFullSubject.next();
    }

    handleCloseItemDropModal() {
        this.closeItemDropSubject.next();
    }
}
