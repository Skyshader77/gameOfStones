import { HostListener, Injectable } from '@angular/core';
import { GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import * as CONSTS from '../constants/edit-page-consts';
import { DataConversionService } from './data-conversion.service';

@Injectable({
    providedIn: 'root',
})
export class EditPageService {
    // ajouter les elements de la carte reçu du backend
    constructor(private dataConversionService: DataConversionService) {}

    currentMap: Map = {
        mapId: 'id',
        name: 'mapName',
        description: '',
        rowSize: CONSTS.SMALL_MAP_SIZE,
        mode: GameMode.CTF,
        mapArray: [],
        lastModification: new Date(),
        placedItems: [],
    };

    originalMap: Map;
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    isDragging: boolean = false;
    draggedItemInitRow: number | null = null;
    draggedItemInitCol: number | null = null;

    selectedTileType: TileTerrain | null;

    initializeMap(): void {
        this.currentMap.mapArray = Array.from({ length: this.currentMap.rowSize }, () =>
            Array.from({ length: this.currentMap.rowSize }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        this.currentMap.placedItems = [];
        this.originalMap = {
            mapId: this.currentMap.mapId,
            name: this.currentMap.name,
            description: this.currentMap.description,
            rowSize: this.currentMap.rowSize,
            mode: this.currentMap.mode,

            mapArray: this.currentMap.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            lastModification: this.currentMap.lastModification,

            placedItems: this.currentMap.placedItems.map((item) => item),
        };
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    getMaxItems(): number {
        switch (this.currentMap.rowSize) {
            case CONSTS.SMALL_MAP_SIZE:
                return CONSTS.SMALL_MAP_ITEM_LIMIT;
                break;
            case CONSTS.MEDIUM_MAP_SIZE:
                return CONSTS.MEDIUM_MAP_ITEM_LIMIT;
                break;
            case CONSTS.LARGE_MAP_SIZE:
                return CONSTS.LARGE_MAP_ITEM_LIMIT;
                break;
            default:
                return 0;
        }
    }

    resetMap() {
        this.currentMap.mapArray = this.originalMap.mapArray.map((row) => row.map((tile) => ({ ...tile })));
        this.currentMap.placedItems = this.originalMap.placedItems.map((item) => item);
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.currentMap.placedItems.includes(item);
        } else {
            const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
            return itemCount === this.getMaxItems();
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.preventDefault();
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        if (this.isRightClick && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        } else if (
            (this.isLeftClick &&
                this.selectedTileType === TileTerrain.CLOSEDDOOR &&
                this.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.CLOSEDDOOR) ||
            this.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.OPENDOOR
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex, this.selectedTileType);
        }
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.stopPropagation();
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        if (this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE && this.isRightClick) {
            event.preventDefault();
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.removeItem(rowIndex, colIndex);
        }
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        this.isDragging = true;
        const item = this.currentMap.mapArray[rowIndex][colIndex].item;

        if (item !== Item.NONE) {
            event.dataTransfer?.setData('itemType', this.dataConversionService.convertItemToString(item));
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
            this.selectTileType(null);
        }
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        console.log('drag end');
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (mapElement) {
            const mapRect = mapElement.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom) {
                if (this.draggedItemInitRow !== null && this.draggedItemInitCol !== null) {
                    this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                    this.draggedItemInitCol = null;
                    this.draggedItemInitRow = null;
                }
            }
        }
        this.isDragging = false;
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): void {
        setTimeout(() => {
            this.isDragging = false;
        }, 5); // Small timeout for the isMouseOver call that immediately follows the drag end to consider isDragging as true

        const itemString = event.dataTransfer?.getData('itemType');
        if (
            itemString &&
            ![TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.currentMap.mapArray[rowIndex][colIndex].terrain)
        ) {
            if (
                this.draggedItemInitRow !== null &&
                this.draggedItemInitCol !== null &&
                this.currentMap.mapArray[rowIndex][colIndex].item === Item.NONE
            ) {
                this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
            }
            const item = this.dataConversionService.convertStringToItem(itemString);
            if (!this.isItemLimitReached(item) && this.currentMap.mapArray[rowIndex][colIndex].item === Item.NONE) {
                this.addItem(rowIndex, colIndex, item);
            }
        }
        this.draggedItemInitRow = null;
        this.draggedItemInitCol = null;
    }

    onMouseUp(): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        if (this.isDragging) {
            return;
        }
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (
            this.isLeftClick &&
            this.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR) &&
            !this.wasItemDeleted
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (
            this.isLeftClick &&
            this.selectedTileType &&
            !this.wasItemDeleted &&
            !(
                [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.selectedTileType) &&
                this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE
            )
        ) {
            this.changeTile(rowIndex, colIndex, this.selectedTileType);
        } else if (this.isRightClick && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        }
    }

    changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
        if (this.selectedTileType) {
            this.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
        }
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            this.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
        } else {
            this.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        let item: Item = this.currentMap.mapArray[rowIndex][colIndex].item;
        this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;

        const index = this.currentMap.placedItems.indexOf(item);
        if (index !== -1) {
            this.currentMap.placedItems.splice(index, 1);
        }
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.currentMap.mapArray[rowIndex][colIndex].item = item;
        this.currentMap.placedItems.push(item);
    }

    isDoorAndWallNumberValid(): boolean {
        let doorOrWallTileNumber = 0;
        for (const row of this.currentMap.mapArray) {
            for (const tile of row) {
                if (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR || tile.terrain === TileTerrain.WALL) {
                    doorOrWallTileNumber++;
                }
            }
        }
        return doorOrWallTileNumber < this.currentMap.rowSize ** 2 / 2;
    }

    isWholeMapAccessible(): boolean {
        return true;
    }

    isDoorSurroundingValid(): boolean {
        for (let row = 0; row < this.currentMap.rowSize; row++) {
            for (let col = 0; col < this.currentMap.rowSize; col++) {
                const currentTile = this.currentMap.mapArray[row][col];
                if (currentTile.terrain === TileTerrain.CLOSEDDOOR || currentTile.terrain === TileTerrain.OPENDOOR) {
                    if (row === 0 || row === this.currentMap.rowSize - 1 || col === 0 || col === this.currentMap.rowSize - 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    //validationService(rowIndex: number, colIndex: number): void {
    // let isMapValid = true;
    // isMapValid = this.isDoorAndWallNumberValid();
    // isMapValid = this.isWholeMapAccessible();
    //}
}
