import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ITEM_PATHS, ITEM_TO_STRING_MAP, TILE_PATHS } from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '@app/constants/validation.constants';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { ITEM_NAMES } from '@common/constants/item-naming.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink, FormsModule],
})
export class SidebarComponent {
    @Output() saveEvent = new EventEmitter<void>();

    gameMode = GameMode;

    itemPaths = ITEM_PATHS;
    tilePaths = TILE_PATHS;

    itemTypes = Object.values(ItemType).filter((value) => typeof value === 'number') as ItemType[];
    itemLabels = ITEM_NAMES;

    tileDescriptions = constants.TILE_DESCRIPTIONS;
    itemDescriptions = constants.ITEM_DESCRIPTIONS;

    itemId = constants.ITEM_ID;
    tiles = constants.SIDEBAR_TILES;

    maxNameLength = MAX_NAME_LENGTH;
    maxDescriptionLength = MAX_DESCRIPTION_LENGTH;

    constructor(public mapManagerService: MapManagerService) {}

    onSaveClicked() {
        this.saveEvent.emit();
    }

    onResetClicked() {
        this.mapManagerService.resetMap();
    }

    selectTile(type: TileTerrain) {
        this.mapManagerService.selectTileType(type);
    }

    isTileTypeSelected(tileType: TileTerrain): boolean {
        return this.mapManagerService.selectedTileType === tileType;
    }

    onDragStart(event: DragEvent, itemType: ItemType) {
        event.dataTransfer?.setData('itemType', ITEM_TO_STRING_MAP[itemType]);
        this.mapManagerService.selectTileType(null);
    }
}
