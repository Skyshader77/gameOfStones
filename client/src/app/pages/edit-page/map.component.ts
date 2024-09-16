import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Item, Tile, TileTerrain } from '@app/interfaces/map';
import * as CONSTS from '../../constants/edit-page-consts';
import { EditPageService } from '../../services/edit-page.service';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent implements OnInit {
    @Input() size: number;
    @Input() selectedTileType: TileTerrain | null;
    @Input() placedItems: Item[] = [];

    mapGrid: Tile[][] = [];

    tileSize: number;

    Item = Item;

    constructor(protected editPageService: EditPageService) {}

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    ngOnInit() {
        this.tileSize = (window.innerHeight * CONSTS.MAP_CONTAINER_HEIGHT_FACTOR) / this.size;
        this.mapGrid = Array.from({ length: this.size }, () =>
            Array.from({ length: this.size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        this.editPageService.initializeMap(this.mapGrid, this.size, this.placedItems);
        this.editPageService.map$.subscribe((updatedMap) => {
            this.mapGrid = updatedMap;
        });
        this.editPageService.resetMap$.subscribe((updatedMap) => {
            this.mapGrid = updatedMap.map((row) => row.map((tile) => ({ ...tile })));
            console.log(this.mapGrid);
        });
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownEmptyTile(event, rowIndex, colIndex, this.selectedTileType);
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownItem(event, rowIndex, colIndex);
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        this.editPageService.onDrop(event, rowIndex, colIndex);
    }

    onMouseUp(): void {
        this.editPageService.onMouseUp();
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseOver(event, rowIndex, colIndex);
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onDragStart(event, rowIndex, colIndex);
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.editPageService.onDragEnd(event);
    }
}
