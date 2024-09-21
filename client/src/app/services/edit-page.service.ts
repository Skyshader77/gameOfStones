import { HostListener, inject, Injectable } from '@angular/core';
import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import { DataConversionService } from './data-conversion.service';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class EditPageService {
    mapApiService: MapAPIService = inject(MapAPIService);
    currentMap: CreationMap = {
        name: 'mapName',
        description: '',
        size: consts.SMALL_MAP_SIZE,
        mode: GameMode.CTF,
        mapArray: [],
        placedItems: [],
    };

    originalMap: CreationMap;

    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    draggedItemInitRow: number | null = null;
    draggedItemInitCol: number | null = null;
    mapId: string;

    selectedTileType: TileTerrain | null;

    constructor(private dataConversionService: DataConversionService) {}

    onInit(mapId: string | null) {
        if (mapId) {
            this.mapApiService.getMapbyId(mapId).subscribe(
                (map: Map) => {
                    console.log('in extras.state');

                    this.currentMap = map as CreationMap;
                    this.originalMap = map as CreationMap;
                    this.mapId = map._id;
                },
                (error) => {
                    console.error('Error fetching map:', error);
                },
            );
        } else {
            console.log('state was empty');
            this.initializeMap();
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
                if (this.draggedItemInitRow !== null && this.draggedItemInitCol !== null) {
                    this.removeItem(this.draggedItemInitRow, this.draggedItemInitCol);
                    this.draggedItemInitCol = null;
                    this.draggedItemInitRow = null;
                }
            }
        }
    }

    initializeMap(): void {
        this.currentMap.mapArray = Array.from({ length: this.currentMap.size }, () =>
            Array.from({ length: this.currentMap.size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        this.currentMap.placedItems = [];
        this.originalMap = {
            name: this.currentMap.name,
            description: this.currentMap.description,
            size: this.currentMap.size,
            mode: this.currentMap.mode,
            mapArray: this.currentMap.mapArray,
            placedItems: this.currentMap.placedItems.map((item) => item),
        };
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    getMaxItems(): number {
        switch (this.currentMap.size) {
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
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
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
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        if (this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE && this.isRightClick) {
            event.preventDefault();
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.removeItem(rowIndex, colIndex);
        }
    }

    fullClickOnItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        if (!this.selectedTileType) return;
        this.changeTile(rowIndex, colIndex, this.selectedTileType);
        if (
            [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.selectedTileType) &&
            this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE
        ) {
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
        const item = this.currentMap.mapArray[rowIndex][colIndex].item;

        if (item !== Item.NONE) {
            event.dataTransfer?.setData('itemType', this.dataConversionService.convertItemToString(item));
            this.draggedItemInitRow = rowIndex;
            this.draggedItemInitCol = colIndex;
            this.selectTileType(null);
        }
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number): void {
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
        this.isRightClick = event.buttons === consts.MOUSE_RIGHT_CLICK_FLAG;
        if ((!this.selectedTileType && !this.isRightClick) || this.wasItemDeleted) {
            return;
        }

        this.isLeftClick = event.buttons === consts.MOUSE_LEFT_CLICK_FLAG;
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (
            this.isLeftClick &&
            this.selectedTileType === TileTerrain.CLOSEDDOOR &&
            (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR)
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex, this.selectedTileType);
            if (
                [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.selectedTileType) &&
                this.currentMap.mapArray[rowIndex][colIndex].item !== Item.NONE
            ) {
                this.removeItem(rowIndex, colIndex);
                this.wasItemDeleted = true;
                setTimeout(() => {
                    this.wasItemDeleted = false;
                }, consts.ITEM_REMOVAL_BUFFER);
            }
        } else if (this.isRightClick) {
            this.changeTile(rowIndex, colIndex, TileTerrain.GRASS);
        }
    }

    changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
        this.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
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
        const item: Item = this.currentMap.mapArray[rowIndex][colIndex].item;
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
        console.log(doorOrWallTileNumber < this.currentMap.size ** 2 / 2);
        return doorOrWallTileNumber < this.currentMap.size ** 2 / 2;
    }

    isWholeMapAccessible(): boolean {
        const visited = Array(this.currentMap.size)
            .fill(null)
            .map(() => Array(this.currentMap.size).fill(false));

        // Find a starting point (a tile that is not a wall)
        let startRow = -1;
        let startCol = -1;
        for (let currentRow = 0; currentRow < this.currentMap.size; currentRow++) {
            for (let currentCol = 0; currentCol < this.currentMap.size; currentCol++) {
                if (!(this.currentMap.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL)) {
                    startRow = currentRow;
                    startCol = currentCol;
                    break;
                }
            }
            if (startRow !== -1) break;
        }

        if (startRow === -1 || startCol === -1) return false;

        this.floodFill(startRow, startCol, visited);

        // Check if all non-wall tiles have been visited
        for (let currentRow = 0; currentRow < this.currentMap.size; currentRow++) {
            for (let currentCol = 0; currentCol < this.currentMap.size; currentCol++) {
                if (!(this.currentMap.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL) && !visited[currentRow][currentCol]) {
                    return false;
                }
            }
        }
        return true;
    }

    floodFill(row: number, col: number, visited: boolean[][]): void {
        const queue: [number, number][] = [[row, col]];
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        while (queue.length > 0) {
            const [currentRow, currentCol] = queue.shift()!;
            if (currentRow < 0 || currentRow >= this.currentMap.size || currentCol < 0 || currentCol >= this.currentMap.size) {
                continue;
            }
            if (visited[currentRow][currentCol] || this.currentMap.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL) {
                continue;
            }

            visited[currentRow][currentCol] = true;

            // Explore neighbors
            for (const [dx, dy] of directions) {
                queue.push([currentRow + dx, currentCol + dy]);
            }
        }
    }

    areDoorSurroundingsValid(): boolean {
        for (let row = 0; row < this.currentMap.size; row++) {
            for (let col = 0; col < this.currentMap.size; col++) {
                const currentTile = this.currentMap.mapArray[row][col];
                if (currentTile.terrain === TileTerrain.CLOSEDDOOR || currentTile.terrain === TileTerrain.OPENDOOR) {
                    if (row === 0 || row === this.currentMap.size - 1 || col === 0 || col === this.currentMap.size - 1) {
                        return false;
                    }
                    if (
                        !(
                            (this.currentMap.mapArray[row + 1][col].terrain === TileTerrain.WALL &&
                                this.currentMap.mapArray[row - 1][col].terrain === TileTerrain.WALL) ||
                            (this.currentMap.mapArray[row][col + 1].terrain === TileTerrain.WALL &&
                                this.currentMap.mapArray[row][col - 1].terrain === TileTerrain.WALL)
                        )
                    ) {
                        return false;
                    }
                    if (
                        this.currentMap.mapArray[row + 1][col].terrain === TileTerrain.WALL &&
                        this.currentMap.mapArray[row - 1][col].terrain === TileTerrain.WALL
                    ) {
                        if (
                            [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(
                                this.currentMap.mapArray[row][col + 1].terrain,
                            ) ||
                            [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(this.currentMap.mapArray[row][col - 1].terrain)
                        ) {
                            return false;
                        } else if (
                            this.currentMap.mapArray[row][col + 1].terrain === TileTerrain.WALL &&
                            this.currentMap.mapArray[row][col - 1].terrain === TileTerrain.WALL
                        ) {
                            if (
                                [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(
                                    this.currentMap.mapArray[row + 1][col].terrain,
                                ) ||
                                [TileTerrain.CLOSEDDOOR, TileTerrain.OPENDOOR, TileTerrain.WALL].includes(
                                    this.currentMap.mapArray[row - 1][col].terrain,
                                )
                            ) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    areAllStartPointsPlaced(): boolean {
        return this.isItemLimitReached(Item.START);
    }

    validateMap(): boolean {
        let isMapValid = true;
        isMapValid =
            this.isDoorAndWallNumberValid() && this.isWholeMapAccessible() && this.areAllStartPointsPlaced() && this.areDoorSurroundingsValid();
        return isMapValid;
    }

    saveMap(): void {
        if (this.mapId) {
            this.mapApiService.getMapbyId(this.mapId).subscribe(
                (map) => {
                    this.mapApiService.updateMap(this.mapId, this.currentMap);
                },
                (error) => {
                    if (error.status === 404) {
                        console.log('mapNotFound');
                    } else {
                        console.log('server sucks');
                    }
                },
            );
        } else {
            console.log('saved');
            this.mapApiService.createMap(this.currentMap).subscribe((error) => console.log(error));
        }
    }
}
