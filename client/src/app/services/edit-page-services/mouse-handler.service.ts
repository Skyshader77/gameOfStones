import { HostListener, Injectable } from '@angular/core';
import * as conversionConstants from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { MapManagerService } from './map-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { Item } from '@common/interfaces/item';

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

        const mapItem = this.mapManagerService.currentMap.placedItems.find(
            (item: Item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
        );

        if (this.isRightClick && mapItem) {
            event.preventDefault();
            this.wasItemDeleted = true;
            this.mapManagerService.removeItem(mapPosition);
        }
    }

    onDragStart(event: DragEvent, mapPosition: Vec2): void {
        const mapItem = this.mapManagerService.currentMap.placedItems.find(
            (item: Item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
        );

        if (mapItem) {
            this.draggedItemPosition = mapPosition;
            event.dataTransfer?.setData('itemType', conversionConstants.ITEM_TO_STRING_MAP[mapItem.type]);
            this.mapManagerService.selectTileType(null);
        }
    }

    fullClickOnItem(mapPosition: Vec2): void {
        if (!this.mapManagerService.selectedTileType) return;
        this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
        const mapItem = this.mapManagerService.currentMap.placedItems.find(
            (item: Item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
        );
        if ([TileTerrain.ClosedDoor, TileTerrain.OpenDoor, TileTerrain.Wall].includes(this.mapManagerService.selectedTileType) && mapItem) {
            this.mapManagerService.removeItem(mapPosition);
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, mapPosition: Vec2): void {
        event.preventDefault();
        this.isRightClick = event.buttons === constants.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === constants.MOUSE_LEFT_CLICK_FLAG;

        if (this.isRightClick && !this.wasItemDeleted) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.Grass);
        } else if (
            this.isLeftClick &&
            this.mapManagerService.selectedTileType === TileTerrain.ClosedDoor &&
            (this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x] === TileTerrain.ClosedDoor ||
                this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x] === TileTerrain.OpenDoor)
        ) {
            this.mapManagerService.toggleDoor(mapPosition);
        } else if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
        }
    }

    onDrop(event: DragEvent, mapPosition: Vec2): void {
        const itemString = event.dataTransfer?.getData('itemType');
        const tile = this.mapManagerService.currentMap.mapArray[mapPosition.y][mapPosition.x];
        const tileItem = this.mapManagerService.getItemType(mapPosition);

        if (itemString && ![TileTerrain.ClosedDoor, TileTerrain.OpenDoor, TileTerrain.Wall].includes(tile)) {
            const item = conversionConstants.STRING_TO_ITEM_MAP[itemString];

            if (this.draggedItemPosition && tileItem === ItemType.NONE) {
                this.mapManagerService.removeItem(this.draggedItemPosition);
            }
            if (!this.mapManagerService.isItemLimitReached(item) && tileItem === ItemType.NONE) {
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
        const tileItem = this.mapManagerService.currentMap.placedItems.find(
            (item: Item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y,
        );

        if (this.isLeftClick && this.mapManagerService.selectedTileType) {
            if (
                this.mapManagerService.selectedTileType === TileTerrain.ClosedDoor &&
                (tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor)
            ) {
                this.mapManagerService.toggleDoor(mapPosition);
            } else {
                this.mapManagerService.changeTile(mapPosition, this.mapManagerService.selectedTileType);
                if ([TileTerrain.ClosedDoor, TileTerrain.OpenDoor, TileTerrain.Wall].includes(this.mapManagerService.selectedTileType) && tileItem) {
                    this.mapManagerService.removeItem(mapPosition);
                    this.wasItemDeleted = true;
                    setTimeout(() => (this.wasItemDeleted = false), constants.ITEM_REMOVAL_BUFFER);
                }
            }
        } else if (this.isRightClick) {
            this.mapManagerService.changeTile(mapPosition, TileTerrain.Grass);
        }
    }
}
