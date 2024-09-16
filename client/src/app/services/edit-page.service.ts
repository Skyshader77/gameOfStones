import { HostListener, Injectable } from '@angular/core';
import { GameMode, Item, Map, Tile, TileTerrain } from '@app/interfaces/map';
import { Subject } from 'rxjs';
import * as CONSTS from '../constants/edit-page-consts';

@Injectable({
    providedIn: 'root',
})
export class EditPageService {
    // ajouter les elements de la carte reçu du backend
    constructor() {}

    currentMap: Map = {
        mapId: 'id',
        name: 'mapName',
        description: '',
        rowSize: CONSTS.SMALL_MAP_SIZE,
        mode: GameMode.NORMAL,
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

    private itemRemovedSource = new Subject<Item>();
    itemRemoved$ = this.itemRemovedSource.asObservable();

    private itemAddedSource = new Subject<Item>();
    itemAdded$ = this.itemAddedSource.asObservable();

    private mapSource = new Subject<Tile[][]>();
    map$ = this.mapSource.asObservable();

    private resetMapSource = new Subject<Tile[][]>();
    resetMap$ = this.resetMapSource.asObservable();

    private resetItemSource = new Subject<Item[]>();
    resetItem$ = this.resetItemSource.asObservable();

    selectedTileType: TileTerrain | null;

    initializeMap(mapArray: Tile[][], rowSize: number, placedItems: Item[]): void {
        this.currentMap.rowSize = rowSize;
        this.currentMap.mapArray = mapArray.map((row) => row.map((tile) => ({ ...tile })));
        this.currentMap.placedItems = placedItems.map((item) => item);
        this.mapSource.next(this.currentMap.mapArray);
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

    resetMap() {
        this.currentMap.mapArray = this.originalMap.mapArray.map((row) => row.map((tile) => ({ ...tile })));
        this.currentMap.placedItems = this.originalMap.placedItems.map((item) => item);

        this.resetMapSource.next(this.originalMap.mapArray);
        this.resetItemSource.next(this.originalMap.placedItems);
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.currentMap.placedItems.includes(item);
        } else {
            const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
            switch (this.currentMap.rowSize) {
                case CONSTS.SMALL_MAP_SIZE:
                    return itemCount === CONSTS.SMALL_MAP_ITEM_LIMIT;
                case CONSTS.MEDIUM_MAP_SIZE:
                    return itemCount === CONSTS.MEDIUM_MAP_ITEM_LIMIT;
                case CONSTS.LARGE_MAP_SIZE:
                    return itemCount === CONSTS.LARGE_MAP_ITEM_LIMIT;
                default:
                    return false;
            }
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number, selectedTileType: TileTerrain | null): void {
        event.preventDefault();
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        this.selectedTileType = selectedTileType;
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

        if (item) {
            event.dataTransfer?.setData('itemType', this.convertItemToString(item));
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
        }
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (mapElement) {
            const mapRect = mapElement.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom) {
                if (this.draggedItemInitRow && this.draggedItemInitCol) {
                    this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                }
            }
        }
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): void {
        setTimeout(() => {
            this.isDragging = false;
        }, 5); // Small timeout for the isMouseOver call that immediately follows the drag end to consider isDragging as true
        if ([TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.currentMap.mapArray[rowIndex][colIndex].terrain)) {
            return;
        }
        const itemString = event.dataTransfer?.getData('itemType');
        if (itemString) {
            if (this.draggedItemInitRow && this.draggedItemInitCol) {
                this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                this.draggedItemInitRow = null;
                this.draggedItemInitCol = null;
            }
            const item = this.convertStringToItem(itemString);
            if (!this.isItemLimitReached(item) && this.currentMap.mapArray[rowIndex][colIndex].item === Item.NONE) {
                this.addItem(rowIndex, colIndex, item);
            }
        }
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
            this.mapSource.next(this.currentMap.mapArray);
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
        this.itemRemovedSource.next(item);
        this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;
        this.mapSource.next(this.currentMap.mapArray);

        const index = this.currentMap.placedItems.indexOf(item);
        if (index !== -1) {
            this.currentMap.placedItems.splice(index, 1);
        }
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.itemAddedSource.next(item);
        this.currentMap.mapArray[rowIndex][colIndex].item = item;
        this.mapSource.next(this.currentMap.mapArray);
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

    convertStringToItem(str: string): Item {
        switch (str) {
            case 'potionBlue': {
                return Item.BOOST1;
            }
            case 'potionGreen': {
                return Item.BOOST2;
            }
            case 'potionRed': {
                return Item.BOOST3;
            }
            case 'sword': {
                return Item.BOOST4;
            }
            case 'armor': {
                return Item.BOOST5;
            }
            case 'axe': {
                return Item.BOOST6;
            }
            case 'randomItem': {
                return Item.RANDOM;
            }
            case 'startPoint': {
                return Item.START;
            }
            case 'flag': {
                return Item.FLAG;
            }
        }
        return Item.NONE;
    }

    convertItemToString(item: Item): string {
        switch (item) {
            case Item.BOOST1: {
                return 'potionBlue';
            }
            case Item.BOOST2: {
                return 'potionGreen';
            }
            case Item.BOOST3: {
                return 'potionRed';
            }
            case Item.BOOST4: {
                return 'sword';
            }
            case Item.BOOST5: {
                return 'armor';
            }
            case Item.BOOST6: {
                return 'axe';
            }
            case Item.RANDOM: {
                return 'randomItem';
            }
            case Item.START: {
                return 'startPoint';
            }
            case Item.FLAG: {
                return 'flag';
            }
        }
        return '';
    }

    convertTerrainToString(terrain: TileTerrain): string {
        switch (terrain) {
            case TileTerrain.GRASS: {
                return 'grass';
            }
            case TileTerrain.ICE: {
                return 'ice';
            }
            case TileTerrain.WATER: {
                return 'water';
            }
            case TileTerrain.CLOSEDDOOR: {
                return 'closed_door';
            }
            case TileTerrain.WALL: {
                return 'wall';
            }
            case TileTerrain.OPENDOOR: {
                return 'open_door';
            }
        }
        return '';
    }
    convertStringToTerrain(str: string): TileTerrain {
        switch (str) {
            case 'grass': {
                return TileTerrain.GRASS;
            }
            case 'ice': {
                return TileTerrain.ICE;
            }
            case 'water': {
                return TileTerrain.WATER;
            }
            case 'closed_door': {
                return TileTerrain.CLOSEDDOOR;
            }
            case 'wall': {
                return TileTerrain.WALL;
            }
        }
        return TileTerrain.GRASS;
    }
}
