import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as consts from '@app/constants/edit-page-consts';
import { GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { DataConversionService } from '@app/services//edit-page-services/data-conversion.service';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { ServerManagerService } from '@app/services/edit-page-services/server-manager.service';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink, FormsModule],
})
export class SidebarComponent {
    @Output() mapValidationStatus = new EventEmitter<{
        doorAndWallNumberValid: boolean;
        wholeMapAccessible: boolean;
        allStartPointsPlaced: boolean;
        doorSurroundingsValid: boolean;
        flagPlaced: boolean;
        allItemsPlaced: boolean;
        nameValid: boolean;
        descriptionValid: boolean;
        isMapValid: boolean;
    }>();
    mapName: string = '';
    mapDescription: string = '';
    gameMode = GameMode;
    convertItemToString = this.dataConversionService.convertItemToString;
    convertStringToTerrain = this.dataConversionService.convertStringToTerrain;
    items = consts.SIDEBAR_ITEMS;
    tiles = consts.SIDEBAR_TILES;

    constructor(
        protected mapManagerService: MapManagerService,
        protected dataConversionService: DataConversionService,
        protected mapValidationService: MapValidationService,
        protected serverManagerService: ServerManagerService,
    ) {}

    getRemainingItems(item: Item): number {
        const itemCount = this.mapManagerService.currentMap.placedItems.filter((placedItem) => placedItem === item).length;

        const maxItems = this.mapManagerService.getMaxItems();

        return maxItems - itemCount;
    }

    onDragStart(event: DragEvent, itemType: Item) {
        event.dataTransfer?.setData('itemType', this.dataConversionService.convertItemToString(itemType));
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
        const validationResults = this.mapValidationService.validateMap(this.mapManagerService.currentMap, this.mapName, this.mapDescription);
        if (validationResults.isMapValid) {
            this.serverManagerService.saveMap(this.mapManagerService.mapId);
        }
        this.mapValidationStatus.emit(validationResults);
    }
}
