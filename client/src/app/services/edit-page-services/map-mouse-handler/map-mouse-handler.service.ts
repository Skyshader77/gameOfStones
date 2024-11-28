import { HostListener, Injectable } from '@angular/core';
import * as conversionConstants from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { Vec2 } from '@common/interfaces/vec2';
import { MapManagerService } from '@app/services/edit-page-services/map-manager/map-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MapMouseHandlerService {
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    draggedItemPosition: Vec2 | null = null;

    constructor(private mapManagerService: MapManagerService) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (!mapElement) return;

        const mapRect = mapElement.getBoundingClientRect();
        const { clientX: x, clientY: y } = event;

        if (this.isOutsideMapBounds(x, y, mapRect) && this.draggedItemPosition) {
            this.mapManagerService.removeItem(this.draggedItemPosition);
            this.draggedItemPosition = null;
        }
    }

    onMouseUp(): void {
        this.resetClickFlags();
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault();
    }

    onMouseDownItem(event: MouseEvent, mapPosition: Vec2): void {
        event.stopPropagation();
        this.updateClickFlags(event);

        const mapItem = this.mapManagerService.getItemAtPosition(mapPosition);

        if (this.isRightClick && mapItem) {
            event.preventDefault();
            this.deleteItem(mapPosition);
        }
    }

    onDragStart(event: DragEvent, mapPosition: Vec2): void {
        const mapItem = this.mapManagerService.getItemAtPosition(mapPosition);

        if (mapItem) {
            this.draggedItemPosition = mapPosition;
            event.dataTransfer?.setData('itemType', conversionConstants.ITEM_TO_STRING_MAP[mapItem.type]);
            this.mapManagerService.selectTileType(null);
        }
    }

    fullClickOnItem(mapPosition: Vec2): void {
        if (!this.mapManagerService.selectedTileType) return;

        const selectedTileType = this.mapManagerService.selectedTileType;
        this.mapManagerService.changeTile(mapPosition, selectedTileType);

        const mapItem = this.mapManagerService.getItemAtPosition(mapPosition);
        if (this.isBlockingTile(selectedTileType) && mapItem) {
            this.mapManagerService.removeItem(mapPosition);
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, mapPosition: Vec2): void {
        event.preventDefault();
        this.updateClickFlags(event);

        const tilePosition = this.mapManagerService.getTileAtPosition(mapPosition);

        if (this.isRightClick) {
            this.handleRightClick(mapPosition);
        } else if (this.isLeftClick) {
            this.handleLeftClick(mapPosition, tilePosition);
        }
    }

    onDrop(event: DragEvent, mapPosition: Vec2): void {
        const itemString = event.dataTransfer?.getData('itemType');
        const tile = this.mapManagerService.getTileAtPosition(mapPosition);
        const tileItem = this.mapManagerService.getItemType(mapPosition);

        if (itemString && this.isTileValidForItem(tile)) {
            const item = this.getItemFromString(itemString);

            this.handleDraggedItemRemoval(tileItem);
            this.handleItemAddition(item, mapPosition, tileItem);
        }

        this.resetDraggedItemPosition();
    }

    onMouseOver(event: MouseEvent, mapPosition: Vec2): void {
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        if (this.shouldIgnoreEvent()) return;

        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.mapManagerService.getTileAtPosition(mapPosition);
        const tileItem = this.mapManagerService.currentMap.placedItems.find(
            (item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
        );

        if (this.isLeftClick) {
            this.handleLeftClick(mapPosition, tile, tileItem);
        } else if (this.isRightClick) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.Grass);
        }
    }

    private deleteItem(mapPosition: Vec2): void {
        this.mapManagerService.removeItem(mapPosition);
        this.wasItemDeleted = true;
        setTimeout(() => (this.wasItemDeleted = false), constants.ITEM_REMOVAL_BUFFER);
    }

    private resetClickFlags(): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    private isOutsideMapBounds(x: number, y: number, mapRect: DOMRect): boolean {
        return x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom;
    }

    private updateClickFlags(event: MouseEvent): void {
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;
    }

    private handleRightClick(mapPosition: Vec2): void {
        if (!this.wasItemDeleted) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.Grass);
        }
    }

    private handleLeftClick(mapPosition: Vec2, tile: TileTerrain, tileItem?: Item): void {
        const selectedTileType = this.mapManagerService.selectedTileType;
        if (!selectedTileType) return;

        if (this.shouldToggleDoor(selectedTileType, tile)) {
            this.mapManagerService.toggleDoor(mapPosition);
        } else {
            this.mapManagerService.changeTile(mapPosition, selectedTileType);

            if (this.isBlockingTile(selectedTileType) && tileItem) {
                this.mapManagerService.removeItem(mapPosition);
                this.wasItemDeleted = true;
                setTimeout(() => (this.wasItemDeleted = false), constants.ITEM_REMOVAL_BUFFER);
            }
        }
    }

    private isTileValidForItem(tile: TileTerrain): boolean {
        return !this.isBlockingTile(tile);
    }

    private isBlockingTile(tile: TileTerrain): boolean {
        return [TileTerrain.ClosedDoor, TileTerrain.OpenDoor, TileTerrain.Wall].includes(tile);
    }

    private getItemFromString(itemString: string): ItemType {
        return conversionConstants.STRING_TO_ITEM_MAP[itemString];
    }

    private handleDraggedItemRemoval(tileItem: ItemType | null): void {
        if (this.draggedItemPosition && tileItem === null) {
            this.mapManagerService.removeItem(this.draggedItemPosition);
        }
    }

    private handleItemAddition(item: ItemType, mapPosition: Vec2, tileItem: ItemType | null): void {
        if (!this.mapManagerService.isItemLimitReached(item) && tileItem === null) {
            this.mapManagerService.addItem(mapPosition, item);
        }
    }

    private resetDraggedItemPosition(): void {
        this.draggedItemPosition = null;
    }

    private shouldIgnoreEvent(): boolean {
        return (!this.mapManagerService.selectedTileType && !this.isRightClick) || this.wasItemDeleted;
    }

    private shouldToggleDoor(selectedTileType: TileTerrain, tile: TileTerrain): boolean {
        return selectedTileType === TileTerrain.ClosedDoor && (tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor);
    }
}
