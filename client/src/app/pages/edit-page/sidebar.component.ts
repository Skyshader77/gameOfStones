import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { itemToStringMap, stringToTerrainMap } from '@app/constants/conversion-consts';
import * as consts from '@app/constants/edit-page-consts';
import { GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { MapAPIService } from '@app/services/map-api.service';
import { finalize } from 'rxjs';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink, FormsModule],
})
export class SidebarComponent {
    @Output() mapValidationStatus = new EventEmitter<{
        validationStatus: {
            doorAndWallNumberValid: boolean;
            wholeMapAccessible: boolean;
            allStartPointsPlaced: boolean;
            doorSurroundingsValid: boolean;
            flagPlaced: boolean;
            allItemsPlaced: boolean;
            nameValid: boolean;
            descriptionValid: boolean;
            isMapValid: boolean;
        };
        message: string;
    }>();
    gameMode = GameMode;
    itemToStringMap = itemToStringMap;
    stringToTerrainMap = stringToTerrainMap;
    items = consts.SIDEBAR_ITEMS;
    tiles = consts.SIDEBAR_TILES;
    modalMessage: string = '';

    constructor(
        protected mapManagerService: MapManagerService,
        protected mapValidationService: MapValidationService,
        private mapApiService: MapAPIService,
    ) {}

    getRemainingItems(item: Item): number {
        const itemCount = this.mapManagerService.currentMap.placedItems.filter((placedItem) => placedItem === item).length;

        const maxItems = this.mapManagerService.getMaxItems();

        return maxItems - itemCount;
    }

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
        const validationResults = this.mapValidationService.validateMap(
            this.mapManagerService.currentMap,
            this.mapManagerService.currentMap.name,
            this.mapManagerService.currentMap.description,
        );
        if (validationResults.isMapValid) {
            if (this.mapManagerService.mapId) {
                const updatedMap: Map = {
                    ...this.mapManagerService.currentMap,
                    _id: this.mapManagerService.mapId,
                    isVisible: true,
                    dateOfLastModification: new Date(),
                };

                this.mapApiService
                    .updateMap(updatedMap)
                    .pipe(
                        finalize(() => {
                            this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.modalMessage = 'Map updated successfully!';
                        },
                        error: (error) => {
                            this.modalMessage = error.error.error;
                        },
                    });
            } else {
                this.mapApiService
                    .createMap(this.mapManagerService.currentMap)
                    .pipe(
                        finalize(() => {
                            this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                        }),
                    )
                    .subscribe({
                        next: (mapId) => {
                            this.modalMessage = 'Map saved successfully!';
                        },
                        error: (error) => {
                            this.modalMessage = error.error.error;
                        },
                    });
            }
        } else {
            this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
        }
    }
}
