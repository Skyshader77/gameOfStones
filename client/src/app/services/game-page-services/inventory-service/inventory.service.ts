import { inject, Injectable } from '@angular/core';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';

@Injectable({
    providedIn: 'root',
})
export class InventoryService {
    private renderingStateService = inject(RenderingStateService);

    handleItemClick(item: ItemType) {
        if (this.renderingStateService.currentlyUsedItem === item) {
            this.renderingStateService.currentlyUsedItem = ItemType.Random;
            this.renderingStateService.displayPlayableTiles = true;
            this.renderingStateService.displayItemTiles = false;
        } else {
            this.renderingStateService.currentlyUsedItem = item;
            this.renderingStateService.displayItemTiles = true;
            this.renderingStateService.displayPlayableTiles = false;
        }
        this.renderingStateService.displayActions = false;
    }
}
