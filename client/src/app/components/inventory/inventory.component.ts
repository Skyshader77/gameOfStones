import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ITEM_PATHS } from '@app/constants/assets.constants';
import { InventoryService } from '@app/services/game-page-services/inventory-service/inventory.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent {
    constructor(
        private myPlayerService: MyPlayerService,
        private rendererStateService: RenderingStateService,
        private inventoryService: InventoryService,
    ) {}

    get myInventory() {
        return this.myPlayerService.getInventory();
    }

    get canUseItems() {
        return this.rendererStateService.displayActions;
    }

    get isMyTurn() {
        return this.myPlayerService.isCurrentPlayer;
    }

    isOffensiveItem(item: ItemType): boolean {
        return item === ItemType.GeodeBomb || item === ItemType.GraniteHammer;
    }

    itemClicked(item: ItemType) {
        if (this.isSpecialItem(item) && this.isMyTurn) {
            this.inventoryService.handleItemClick(item);
        }
    }

    isCurrentlySelectedItem(item: ItemType): boolean {
        return item === this.rendererStateService.currentlySelectedItem;
    }

    isSpecialItem(item: ItemType): boolean {
        return item === ItemType.GraniteHammer || item === ItemType.GeodeBomb;
    }

    getItemImagePath(item: ItemType): string {
        return ITEM_PATHS[item];
    }
}
