import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { itemToStringMap, stringToTerrainMap } from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { ValidationStatus } from '@app/interfaces/validation';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink, FormsModule],
})
export class SidebarComponent {
    gameMode = GameMode;
    itemToStringMap = itemToStringMap;
    stringToTerrainMap = stringToTerrainMap;
    tileDescriptions = constants.TILE_DESCRIPTIONS;
    itemDescriptions = constants.ITEM_DESCRIPTIONS;
    items = constants.SIDEBAR_ITEMS;
    tiles = constants.SIDEBAR_TILES;

    constructor(
        protected mapManagerService: MapManagerService,
        private mapValidationService: MapValidationService,
    ) {}

    onDragStart(event: DragEvent, itemType: Item) {
        event.dataTransfer?.setData('itemType', itemToStringMap[itemType]);
        this.mapManagerService.selectTileType(null);
    }

    selectTile(type: TileTerrain) {
        this.mapManagerService.selectTileType(type);
    }

    isTileTypeSelected(tileType: TileTerrain): boolean {
        return this.mapManagerService.selectedTileType === tileType;
    }

    onResetClicked() {
        this.mapManagerService.resetMap();
    }

    onSaveClicked() {
        const validationResults: ValidationStatus = this.mapValidationService.validateMap(this.mapManagerService.currentMap);
        this.mapManagerService.handleSave(validationResults);
    }
}
