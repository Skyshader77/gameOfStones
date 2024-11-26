import { Component } from '@angular/core';
import { ITEM_PATHS } from '@app/constants/conversion.constants';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ItemType } from '@common/enums/item-type.enum';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [],
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent {
    constructor(
        private myPlayerService: MyPlayerService,
        private rendererStateService: RenderingStateService,
    ) {}

    get myInventory() {
        return this.myPlayerService.getInventory();
    }

    get canUseItems() {
        return this.rendererStateService.displayActions;
    }

    isSpecialItem(item: ItemType): boolean {
        return item === ItemType.GraniteHammer || item === ItemType.GeodeBomb;
    }

    getItemImagePaths(items: ItemType[]): string[] {
        return items?.map((item) => ITEM_PATHS[item]);
    }
}
