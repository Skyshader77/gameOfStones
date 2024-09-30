import { HostListener, Injectable } from '@angular/core';
import * as conversionConsts from '@app/constants/conversion-consts';
import * as consts from '@app/constants/edit-page-consts';
import { Item, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MouseHandlerService {
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    draggedItemInitRow: number | null = null;
    draggedItemInitCol: number | null = null;

    constructor(private mapManagerService: MapManagerService) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (mapElement) {
            const mapRect = mapElement.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom) {
                if (this.draggedItemInitRow !== null && this.draggedItemInitCol !== null) {
                    this.mapManagerService.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                    this.draggedItemInitCol = null;
                    this.draggedItemInitRow = null;
                }
            }
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.preventDefault();
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        if (this.isRightClick && !this.wasItemDeleted) {
            this.mapManagerService.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        } else if (
            this.isLeftClick &&
            this.mapManagerService.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.CLOSEDDOOR ||
                this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.OPENDOOR)
        ) {
            this.mapManagerService.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            this.mapManagerService.changeTile(rowIndex, colIndex, this.mapManagerService.selectedTileType);
        }
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.stopPropagation();
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        if (this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE && this.isRightClick) {
            event.preventDefault();
            this.wasItemDeleted = true;
            this.mapManagerService.removeItem(rowIndex, colIndex);
        }
    }

    fullClickOnItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        if (!this.mapManagerService.selectedTileType) return;
        this.mapManagerService.changeTile(rowIndex, colIndex, this.mapManagerService.selectedTileType);
        if (
            [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.mapManagerService.selectedTileType) &&
            this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE
        ) {
            this.mapManagerService.removeItem(rowIndex, colIndex);
        }
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault();
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        const item = this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item;

        if (item !== Item.NONE) {
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
            event.dataTransfer?.setData('itemType', conversionConsts.itemToStringMap[item]);
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
            this.mapManagerService.selectTileType(null);
        }
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): void {
        const itemString = event.dataTransfer?.getData('itemType');
        if (
            itemString &&
            ![TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(
                this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].terrain,
            )
        ) {
            if (
                this.draggedItemInitRow !== null &&
                this.draggedItemInitCol !== null &&
                this.draggedItemInitRow !== null &&
                this.draggedItemInitCol !== null &&
                this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item === Item.NONE
            ) {
                this.mapManagerService.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                this.mapManagerService.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
            }
            const item = conversionConsts.stringToItemMap[itemString];
            if (
                !this.mapManagerService.isItemLimitReached(item) &&
                this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item === Item.NONE
            ) {
                this.mapManagerService.addItem(rowIndex, colIndex, item);
            }
        }
        this.draggedItemInitRow = null;
        this.draggedItemInitCol = null;
        this.draggedItemInitRow = null;
        this.draggedItemInitCol = null;
    }

    onMouseUp(): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        if ((!this.mapManagerService.selectedTileType && !this.isRightClick) || this.wasItemDeleted) {
            return;
        }

        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.mapManagerService.currentMap.mapArray[rowIndex][colIndex];
        if (
            this.isLeftClick &&
            this.mapManagerService.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR)
        ) {
            this.mapManagerService.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            this.mapManagerService.changeTile(rowIndex, colIndex, this.mapManagerService.selectedTileType);
            if (
                [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.mapManagerService.selectedTileType) &&
                this.mapManagerService.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE
            ) {
                this.mapManagerService.removeItem(rowIndex, colIndex);
                this.wasItemDeleted = true;
                setTimeout(() => {
                    this.wasItemDeleted = false;
                }, consts.ITEM_REMOVAL_BUFFER);
            }
        } else if (this.isRightClick) {
            this.mapManagerService.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        }
    }
}
