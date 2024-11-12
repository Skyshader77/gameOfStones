import { Component, EventEmitter, Output } from '@angular/core';
import { ITEM_TO_STRING_MAP } from '@app/constants/conversion.constants';
import { ITEM_SPRITES_FOLDER, SPRITE_FILE_EXTENSION } from '@app/constants/rendering.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ItemType } from '@common/enums/item-type.enum';

@Component({
    selector: 'app-item-drop-decision',
    standalone: true,
    imports: [],
    templateUrl: './item-drop-decision.component.html',
    styleUrl: './item-drop-decision.component.scss',
})
export class ItemDropDecisionComponent {
    itemSpritesFolder = ITEM_SPRITES_FOLDER;
    itemToStringMap = ITEM_TO_STRING_MAP;
    spriteFileExtension = SPRITE_FILE_EXTENSION;

    @Output() itemDropSelected = new EventEmitter<void>();

    constructor(
        private myPlayerService: MyPlayerService,
        private gameLogicSocketService: GameLogicSocketService,
    ) {}

    get inventory() {
        return this.myPlayerService.getInventory();
    }

    onItemClick(item: ItemType) {
        this.gameLogicSocketService.sendItemDropChoice(item);
        this.itemDropSelected.emit();
    }
}
