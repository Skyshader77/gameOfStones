import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

interface Tile {
    tileType: string;
    item: string | null;
}

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent {
    @Input() size: number = 20;
    @Input() selectedTileType: string = '';

    @Output() selectedTileTypeChange = new EventEmitter<string>();
    @Output() itemPlaced = new EventEmitter<string>();
    @Output() itemRemoved = new EventEmitter<string>();

    mapGrid: Tile[][] = [];

    tileSize: number = (window.innerHeight * 0.95) / this.size;
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    isDragging: boolean = false;

    draggedItemRow: number | null = null;
    draggedItemCol: number | null = null;

    ngOnInit() {
        this.initializeMap();
    }

    initializeMap() {
        this.mapGrid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({ tileType: 'grass', item: null })));
    }

    hasItemPlaced(item: string | undefined): boolean {
        return this.mapGrid.some((row) => row.some((tile) => tile.item === item));
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.mapGrid[rowIndex][colIndex];
        if (tile.tileType === 'closed_door') {
            tile.tileType = 'open_door';
        } else {
            tile.tileType = 'closed_door';
        }
    }
    onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log('mouseDownBase');
        this.isRightClick = event.button === 2;
        this.isLeftClick = event.button === 0;
        if (this.isRightClick && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        } else if (
            (this.isLeftClick && this.selectedTileType === 'closed_door' && this.mapGrid[rowIndex][colIndex].tileType === 'closed_door') ||
            this.mapGrid[rowIndex][colIndex].tileType === 'closed_door'
        ) {
            this.toggleDoor(rowIndex, colIndex);
        } else if (this.isLeftClick) {
            this.changeTile(rowIndex, colIndex);
        }
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log('mouseDownItem');
        event.stopPropagation();
        this.isRightClick = event.button === 2;
        this.isLeftClick = event.button === 0;
        if (this.mapGrid[rowIndex][colIndex].item && this.isRightClick) {
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

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        setTimeout(() => {
            this.isDragging = false;
        }, 5); // Minuscule timeout for the isMouseOver call that immediately follows the drag end to consider isDragging as true
        const itemType = event.dataTransfer?.getData('itemType');

        if (this.draggedItemRow && this.draggedItemCol) {
            this.removeItem(this.draggedItemRow, this.draggedItemCol);
        }
        if (itemType) {
            this.mapGrid[rowIndex][colIndex].item = itemType;

            this.itemPlaced.emit(itemType);
        }
    }

    onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log(this.isDragging);
        if (this.isDragging) {
            return;
        }
        const tile = this.mapGrid[rowIndex][colIndex];
        if (
            event.buttons === 1 &&
            this.selectedTileType === 'closed_door' &&
            (tile.tileType === 'closed_door' || tile.tileType === 'open_door') &&
            !this.wasItemDeleted
        ) {
            this.toggleDoor(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 1 && this.selectedTileType && !this.wasItemDeleted) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 2 && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
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
                console.log(this.draggedItemRow);
                if (this.draggedItemRow && this.draggedItemCol) {
                    this.removeItem(this.draggedItemRow, this.draggedItemCol);
                }
            }
        }
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        this.isDragging = true;
        console.log('drag started');
        const item = this.mapGrid[rowIndex][colIndex].item;

        if (item) {
            event.dataTransfer?.setData('itemType', item);
            this.draggedItemRow = rowIndex;
            this.draggedItemCol = colIndex;
        }
    }

    changeTile(rowIndex: number, colIndex: number) {
        console.log('tile changed');
        if (this.selectedTileType) {
            this.mapGrid[rowIndex][colIndex].tileType = this.selectedTileType; // Update the tile with the selected type
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        this.itemRemoved.emit(this.mapGrid[rowIndex][colIndex].item || undefined);
        this.mapGrid[rowIndex][colIndex].item = null;
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        this.mapGrid[rowIndex][colIndex].tileType = 'grass'; // Assuming 'grass' is the default type
    }

    isDoorAndWallNumberValid(): boolean {
        let doorOrWallTileNumber: number = 0;
        for (let row of this.mapGrid) {
            for (let tile of row) {
                if (tile.tileType === 'closed_door' || tile.tileType === 'open_door' || tile.tileType === 'wall') {
                    doorOrWallTileNumber++;
                }
            }
        }
        return doorOrWallTileNumber < this.size ** 2 / 2;
    }

    isWholeMapAccessible(): boolean {
        return true;
    }

    isDoorSurroundingValid() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                let currentTile = this.mapGrid[row][col];
                if (currentTile.tileType === 'closed_door' || currentTile.tileType === 'open_door') {
                    if (row == 0 || row || this.size - 1 || col == 0 || col == this.size - 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    validationService(rowIndex: number, colIndex: number): void {
        //let isMapValid = true;
        //isMapValid = this.isDoorAndWallNumberValid();
        //isMapValid = this.isWholeMapAccessible();
    }
}
