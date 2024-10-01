import { HostListener, Injectable } from '@angular/core';
import * as conversionConstants from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { Item, TileTerrain } from '@app/interfaces/map';
import { Vec2 } from '@app/interfaces/vec2';
import { MapManagerService } from './map-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MouseHandlerService {
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    draggedItemPosition: Vec2 | null = null;

    constructor(private mapManagerService: MapManagerService) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (mapElement) {
            const mapRect = mapElement.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom) {
                if (this.draggedItemPosition) {
                    this.mapManagerService.removeItem(this.draggedItemPosition);
                    this.draggedItemPosition = null;
                }
            }
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onMouseUp(): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault();
    }

    onMouseDownItem(event: MouseEvent, mapPosition: Vec2): void {
        event.stopPropagation();
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;

        if (this.isRightClick && this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x].item !== Item.NONE) {
            event.preventDefault();
            this.wasItemDeleted = true;
            this.mapManagerService.removeItem(mapPosition);
        }
    }

    onDragStart(event: DragEvent, mapPosition: Vec2): void {
        const item = this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x].item;

        if (item !== Item.NONE) {
            this.draggedItemPosition = mapPosition;
            event.dataTransfer?.setData('itemType', conversionConstants.ITEM_TO_STRING_MAP[item]);
            this.mapManagerService.selectTileType(null);
        }
    }

    fullClickOnItem(event: MouseEvent, mapPosition: Vec2): void {
        if (!this.mapManagerService.selectedTileType) return;
        this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
        if (
            [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.mapManagerService.selectedTileType) &&
            this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x].item !== Item.NONE
        ) {
            this.mapManagerService.removeItem(mapPosition);
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, mapPosition: Vec2): void {
        event.preventDefault();
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;

        if (this.isRightClick && !this.wasItemDeleted) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.GRASS);
        } else if (
            this.isLeftClick &&
            this.mapManagerService.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x].terrain === TileTerrain.CLOSEDDOOR ||
                this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x].terrain === TileTerrain.OPENDOOR)
        ) {
            this.mapManagerService.toggleDoor(mapPosition);
        } else if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
        }
    }

    onDrop(event: DragEvent, mapPosition: Vec2): void {
        const itemString = event.dataTransfer?.getData('itemType');
        const tile = this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x];

        if (itemString && ![TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(tile.terrain)) {
            const item = conversionConstants.STRING_TO_ITEM_MAP[itemString];

            if (this.draggedItemPosition && tile.item === Item.NONE) {
                this.mapManagerService.removeItem(this.draggedItemPosition);
            }

            if (!this.mapManagerService.isItemLimitReached(item) && tile.item === Item.NONE) {
                this.mapManagerService.addItem(mapPosition, item);
            }
        }

        this.draggedItemPosition = null;
    }

    onMouseOver(event: MouseEvent, mapPosition: Vec2): void {
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        if ((!this.mapManagerService.selectedTileType && !this.isRightClick) || this.wasItemDeleted) return;

        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x];

        if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            if (
                this.mapManagerService.selectedTileType === TileTerrain.CLOSEDDOOR &&
                (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR)
            ) {
                this.mapManagerService.toggleDoor(mapPosition);
            } else {
                this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
                if (
                    [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.mapManagerService.selectedTileType) &&
                    tile.item !== Item.NONE
                ) {
                    this.mapManagerService.removeItem(mapPosition);
                    this.wasItemDeleted = true;
                    setTimeout(() => (this.wasItemDeleted = false), constants.ITEM_REMOVAL_BUFFER);
                }
            }
        } else if (this.isRightClick) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.GRASS);
        }
    }
}
