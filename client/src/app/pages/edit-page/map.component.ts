import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent {
    @Input() size: number = 10;
    @Input() selectedTileType: string = ''; // The tile selected in the sidebar
    tiles: string[][] = [];
    tileSize: number = 900 / this.size;
    isMouseDown: boolean = false;
    isRightClick: boolean = false;

    onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
        event.preventDefault();
        this.isRightClick = event.button === 2;
        if (this.isRightClick) {
            this.revertTileToGrass(rowIndex, colIndex);
        } else {
            this.isMouseDown = true;
            this.changeTile(rowIndex, colIndex);
        }
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onMouseUp(): void {
        this.isMouseDown = false;
        this.isRightClick = false;
    }

    onMouseOver(rowIndex: number, colIndex: number): void {
        if (this.isMouseDown) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        }
        if (this.isRightClick) {
            this.revertTileToGrass(rowIndex, colIndex); // Add tile type while mouse is held down
        }
    }

    ngOnInit() {
        this.initializeMap();
    }

    initializeMap() {
        this.tiles = Array(this.size)
            .fill(null)
            .map(() => Array(this.size).fill('grass'));
    }

    changeTile(rowIndex: number, colIndex: number) {
        if (this.selectedTileType) {
            this.tiles[rowIndex][colIndex] = this.selectedTileType; // Update the tile with the selected type
        }
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        this.tiles[rowIndex][colIndex] = 'grass'; // Assuming 'grass' is the default type
    }
}
