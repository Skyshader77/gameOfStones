import { HostListener, Injectable } from '@angular/core';
import * as consts from '@app/constants/edit-page-consts';
import { EditionMap, GameMode, Item, Tile, TileTerrain } from '@app/interfaces/map';
import { DataConversionService } from './data-conversion.service';

@Injectable({
    providedIn: 'root',
})
export class EditPageService {
    // ajouter les elements de la carte reçu du backend
    currentMap: EditionMap = {
        mapId: 'id',
        name: 'mapName',
        description: '',
        rowSize: consts.SMALL_MAP_SIZE,
        mode: GameMode.CTF,
        mapArray: [],
        lastModification: new Date(),
        placedItems: [],
    };

    originalMap: EditionMap;

    mapGrid: Tile[][];
    originalMapGrid: Tile[][];

    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    draggedItemInitRow: number | null = null;
    draggedItemInitCol: number | null = null;

    selectedTileType: TileTerrain | null;

    constructor(private dataConversionService: DataConversionService) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
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
    }

    initializeMap(): void {
        this.mapGrid = Array.from({ length: this.currentMap.rowSize }, () =>
            Array.from({ length: this.currentMap.rowSize }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        this.originalMapGrid = this.mapGrid.map((row) => row.map((tile) => ({ ...tile })));
        this.currentMap.placedItems = [];
        this.originalMap = {
            mapId: this.currentMap.mapId,
            name: this.currentMap.name,
            description: this.currentMap.description,
            rowSize: this.currentMap.rowSize,
            mode: this.currentMap.mode,
            mapArray: this.currentMap.mapArray,
            lastModification: this.currentMap.lastModification,

            placedItems: this.currentMap.placedItems.map((item) => item),
        };
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    getMaxItems(): number {
        switch (this.currentMap.rowSize) {
            case consts.SMALL_MAP_SIZE:
                return consts.SMALL_MAP_ITEM_LIMIT;
            case consts.MEDIUM_MAP_SIZE:
                return consts.MEDIUM_MAP_ITEM_LIMIT;
            case consts.LARGE_MAP_SIZE:
                return consts.LARGE_MAP_ITEM_LIMIT;
            default:
                return 0;
        }
    }

    resetMap() {
        this.mapGrid = this.originalMapGrid.map((row) => row.map((tile) => ({ ...tile })));
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
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        if (this.isRightClick && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        } else if (
            (this.isLeftClick &&
                this.selectedTileType === TileTerrain.CLOSEDDOOR &&
                this.mapGrid[rowIndex][colIndex].terrain === TileTerrain.CLOSEDDOOR) ||
            this.mapGrid[rowIndex][colIndex].terrain === TileTerrain.OPENDOOR
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex, this.selectedTileType);
        }
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.stopPropagation();
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        if (this.mapGrid[rowIndex][colIndex].item !== Item.NONE && this.isRightClick) {
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
        const item = this.mapGrid[rowIndex][colIndex].item;

        if (item !== Item.NONE) {
            event.dataTransfer?.setData('itemType', this.dataConversionService.convertItemToString(item));
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
            this.selectTileType(null);
        }
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): void {
        const itemString = event.dataTransfer?.getData('itemType');
        if (itemString && ![TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.mapGrid[rowIndex][colIndex].terrain)) {
            if (this.draggedItemInitRow !== null && this.draggedItemInitCol !== null && this.mapGrid[rowIndex][colIndex].item === Item.NONE) {
                this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
            }
            const item = this.dataConversionService.convertStringToItem(itemString);
            if (!this.isItemLimitReached(item) && this.mapGrid[rowIndex][colIndex].item === Item.NONE) {
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
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        if (!this.selectedTileType && !this.isRightClick) {
            return;
        }

        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.mapGrid[rowIndex][colIndex];
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
                this.mapGrid[rowIndex][colIndex].item !== Item.NONE
            )
        ) {
            this.changeTile(rowIndex, colIndex, this.selectedTileType);
        } else if (this.isRightClick && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        }
    }

    changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
        this.mapGrid[rowIndex][colIndex].terrain = tileType;
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.mapGrid[rowIndex][colIndex];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            this.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
        } else {
            this.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        const item: Item = this.mapGrid[rowIndex][colIndex].item;
        this.mapGrid[rowIndex][colIndex].item = Item.NONE;

        const index = this.currentMap.placedItems.indexOf(item);
        if (index !== -1) {
            this.currentMap.placedItems.splice(index, 1);
        }
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.mapGrid[rowIndex][colIndex].item = item;
        this.currentMap.placedItems.push(item);
    }

    isDoorAndWallNumberValid(): boolean {
        let doorOrWallTileNumber = 0;
        for (const row of this.mapGrid) {
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
                const currentTile = this.mapGrid[row][col];
                if (currentTile.terrain === TileTerrain.CLOSEDDOOR || currentTile.terrain === TileTerrain.OPENDOOR) {
                    if (row === 0 || row === this.currentMap.rowSize - 1 || col === 0 || col === this.currentMap.rowSize - 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // validationService(rowIndex: number, colIndex: number): void {
    // let isMapValid = true;
    // isMapValid = this.isDoorAndWallNumberValid();
    // isMapValid = this.isWholeMapAccessible();
    // }
}
