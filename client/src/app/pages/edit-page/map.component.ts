import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Tile {
    tileType: string;
    item: string | null;
}

enum MapState {
    Edit,
    Preview,
    Play,
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

    currentState: MapState = MapState.Edit;

    ngOnInit() {
        this.initializeMap();
    }

    initializeMap() {
        this.mapGrid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({ tileType: 'grass', item: null })));
    }

    hasItemPlaced(item: string | undefined): boolean {
        return this.mapGrid.some((row) => row.some((tile) => tile.item === item));
    }

    onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.preventDefault();
        this.isRightClick = event.button === 2;
        this.isLeftClick = event.button === 0;
        if (this.mapGrid[rowIndex][colIndex].item && this.isRightClick) {
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.itemRemoved.emit(this.mapGrid[rowIndex][colIndex].item || undefined);
            this.removeItem(rowIndex, colIndex);
        } else if (this.isRightClick && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        } else if (this.isLeftClick) {
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
        if (this.currentState === MapState.Edit) {
            if (itemType && !this.hasItemPlaced(itemType)) {
                this.mapGrid[rowIndex][colIndex].item = itemType;
                this.itemPlaced.emit(itemType);
            }
        }
    }

    onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log(this.isLeftClick);
        if (event.buttons === 1 && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 2 && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        }
    }

    changeTile(rowIndex: number, colIndex: number) {
        if (this.currentState === MapState.Edit) {
            if (this.selectedTileType) {
                this.mapGrid[rowIndex][colIndex].tileType = this.selectedTileType; // Update the tile with the selected type
            }
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        if (this.currentState === MapState.Edit) {
            this.mapGrid[rowIndex][colIndex].item = null;
        }
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        if (this.currentState === MapState.Edit) {
            this.mapGrid[rowIndex][colIndex].tileType = 'grass'; // Assuming 'grass' is the default type
        }
    }
}
