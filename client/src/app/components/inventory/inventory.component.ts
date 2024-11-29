import { Component } from '@angular/core';
import { ITEM_PATHS } from '@app/constants/assets.constants';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { ItemType } from '@common/enums/item-type.enum';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [],
    templateUrl: './inventory.component.html',
})
export class InventoryComponent {
    constructor(private myPlayerService: MyPlayerService) {}

    get myInventory() {
        return this.myPlayerService.getInventory();
    }

    getItemImagePaths(items: ItemType[]): string[] {
        return items?.map((item) => ITEM_PATHS[item]);
    }
}
