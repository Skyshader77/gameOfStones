import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ITEM_PATHS, ITEM_TO_STRING_MAP, TILE_PATHS } from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { Pages } from '@app/constants/pages.constants';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '@app/constants/validation.constants';
import { MapManagerService } from '@app/services/edit-page-services/map-manager/map-manager.service';
import { ITEM_NAMES } from '@common/constants/item-naming.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
})
export class SidebarComponent {
    @Output() saveEvent = new EventEmitter<void>();

    gameMode = GameMode;
    pages = Pages;

    itemPaths = ITEM_PATHS;
    tilePaths = TILE_PATHS;

    itemTypes = Object.values(ItemType).filter((value) => typeof value === 'number') as ItemType[];
    itemLabels = ITEM_NAMES;

    tileDescriptions = constants.TILE_DESCRIPTIONS;
    itemDescriptions = constants.ITEM_DESCRIPTIONS;

    itemId = constants.ITEM_ID;
    tiles = constants.SIDEBAR_TILES;

    faBackwardIcon = faBackward;

    maxNameLength = MAX_NAME_LENGTH;
    maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
    constructor(private mapManagerService: MapManagerService) {}

    get mode() {
        return this.mapManagerService.currentMap.mode;
    }

    get mapName() {
        return this.mapManagerService.currentMap.name;
    }

    get mapDescription() {
        return this.mapManagerService.currentMap.description;
    }

    set mapName(newName: string) {
        this.mapManagerService.currentMap.name = newName;
    }

    set mapDescription(newDescription: string) {
        this.mapManagerService.currentMap.description = newDescription;
    }

    isItemLimitReached(item: ItemType): boolean {
        return this.mapManagerService.isItemLimitReached(item);
    }

    getRemainingStarts(item: ItemType): number {
        return this.mapManagerService.getRemainingStart(item);
    }

    getRemaininRandomItems(): number {
        return this.mapManagerService.getRemainingRandom();
    }

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
