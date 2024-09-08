import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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
    @Input() size: number = 10;
    @Input() selectedTileType: string = '';

    @Output() selectedTileTypeChange = new EventEmitter<string>();
    @Output() itemPlaced = new EventEmitter<string>();
    @Output() itemRemoved = new EventEmitter<string>();

    mapGrid: Tile[][] = [];

    tileSize: number = 900 / this.size;
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;

    ngOnInit() {
        this.initializeMap();
    }

    hasItemPlaced(item: string | undefined): boolean {
        return this.mapGrid.some((row) => row.some((tile) => tile.item === item));
    }

    onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.preventDefault();
        this.isRightClick = event.button === 2;
        if (this.mapGrid[rowIndex][colIndex].item && this.isRightClick) {
            this.selectedTileTypeChange.emit(''); // Notify parent component
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.itemRemoved.emit(this.mapGrid[rowIndex][colIndex].item || undefined);
            this.removeItem(rowIndex, colIndex);
        } else if (this.isRightClick && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        } else {
            this.isLeftClick = true;
            this.changeTile(rowIndex, colIndex);
        }
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        const itemType = event.dataTransfer?.getData('itemType');
        if (itemType && !this.hasItemPlaced(itemType)) {
            this.mapGrid[rowIndex][colIndex].item = itemType;
            this.itemPlaced.emit(itemType);
        }
    }

    onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(rowIndex: number, colIndex: number): void {
        if (this.isLeftClick && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (this.isRightClick && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        }
    }

    initializeMap() {
        this.mapGrid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({ tileType: 'grass', item: null })));
    }

    changeTile(rowIndex: number, colIndex: number) {
        if (this.selectedTileType) {
            this.mapGrid[rowIndex][colIndex].tileType = this.selectedTileType; // Update the tile with the selected type
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        this.mapGrid[rowIndex][colIndex].item = null;
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        this.mapGrid[rowIndex][colIndex].tileType = 'grass'; // Assuming 'grass' is the default type
    }
}
