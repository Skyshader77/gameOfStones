import { EventEmitter, HostListener, Injectable } from '@angular/core';
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
        rowSize: 20,
        mode: GameMode.NORMAL,
        mapArray: [],
        // TODO players in map?

        // TODO get date from backend
        lastModification: new Date(),
    };

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

    placedItems: Item[] = [];
    selectedTileType: TileTerrain | null;

    selectedTileTypeChange = new EventEmitter<TileTerrain>();
    itemRemoved = new EventEmitter<Item>();

    initializeMap(rowSize: number): Tile[][] {
        this.currentMap.mapArray = Array.from({ length: this.currentMap.rowSize }, () =>
            Array.from({ length: this.currentMap.rowSize }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        return this.currentMap.mapArray;
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.placedItems.includes(item);
        } else {
            const itemCount = this.placedItems.filter((placedItem) => placedItem === item).length;
            switch (this.currentMap.rowSize) {
                case 10:
                    return itemCount === 2;
                    break;
                case 15:
                    return itemCount === 4;
                    break;
                case 20:
                    return itemCount === 6;
                    break;
                default:
                    return false;
            }
        }
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            tile.terrain = TileTerrain.OPENDOOR;
        } else {
            tile.terrain = TileTerrain.CLOSEDDOOR;
        }
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number, selectedTileType: TileTerrain | null): Tile[][] {
        event.preventDefault();
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        this.selectedTileType = selectedTileType;
        if (this.isRightClick && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        } else if (
            (this.isLeftClick &&
                this.selectedTileType === TileTerrain.CLOSEDDOOR &&
                this.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.CLOSEDDOOR) ||
            this.currentMap.mapArray[rowIndex][colIndex].terrain === TileTerrain.OPENDOOR
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick) {
            this.changeTile(rowIndex, colIndex);
        }
        return this.currentMap.mapArray;
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): Tile[][] {
        event.stopPropagation();
        this.isRightClick = event.buttons === CONSTS.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === CONSTS.MOUSE_LEFT_CLICK_FLAG;
        if (this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE && this.isRightClick) {
            event.preventDefault();
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.removeItem(rowIndex, colIndex);
        }
        return this.currentMap.mapArray;
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): Tile[][] {
        this.isDragging = true;
        console.log('drag started');
        const item = this.currentMap.mapArray[rowIndex][colIndex].item;

        if (item) {
            event.dataTransfer?.setData('itemType', this.convertItemToString(item));
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
        }
        return this.currentMap.mapArray;
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): Tile[][] {
        console.log('drag ended');
        const mapElement = document.querySelector('.map-container') as HTMLElement;
        if (mapElement) {
            const mapRect = mapElement.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < mapRect.left || x > mapRect.right || y < mapRect.top || y > mapRect.bottom) {
                console.log(this.draggedItemInitRow);
                if (this.draggedItemInitRow && this.draggedItemInitCol) {
                    this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                }
            }
        }
        return this.currentMap.mapArray;
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): Tile[][] {
        setTimeout(() => {
            this.isDragging = false;
        }, 5); // Small timeout for the isMouseOver call that immediately follows the drag end to consider isDragging as true
        if ([TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.currentMap.mapArray[rowIndex][colIndex].terrain)) {
            return this.currentMap.mapArray;
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
                this.currentMap.mapArray[rowIndex][colIndex].item = item;
                this.itemAddedSource.next(this.currentMap.mapArray[rowIndex][colIndex].item);
            }
        }
        return this.currentMap.mapArray;
    }

    onMouseUp(): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): Tile[][] {
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (
            event.buttons === 1 &&
            this.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR) &&
            !this.wasItemDeleted
        ) {
            this.toggleDoor(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 1 && this.selectedTileType && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 2 && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        }
        return this.currentMap.mapArray;
    }

    changeTile(rowIndex: number, colIndex: number) {
        if (this.selectedTileType) {
            this.currentMap.mapArray[rowIndex][colIndex].terrain = this.selectedTileType; // Update the tile with the selected type
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        this.itemRemovedSource.next(this.currentMap.mapArray[rowIndex][colIndex].item);
        this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        this.currentMap.mapArray[rowIndex][colIndex].terrain = TileTerrain.GRASS; // Assuming 'grass' is the default type
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
}
