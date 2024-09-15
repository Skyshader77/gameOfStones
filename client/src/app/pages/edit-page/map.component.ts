import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { GameMode, Item, Tile, TileTerrain } from '@app/interfaces/map';
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

    @Output() selectedTileTypeChange = new EventEmitter<TileTerrain>();
    @Output() itemPlaced = new EventEmitter<Item>();
    @Output() itemRemoved = new EventEmitter<Item>();

    mapGrid: Tile[][] = [];

    gameMode: GameMode = GameMode.CTF;

    tileSize: number;
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;
    isDragging: boolean = false;
    draggedItemRow: number | null = null;
    draggedItemCol: number | null = null;

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
        this.mapGrid = this.editPageService.initializeMap(this.size);
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mapGrid = this.editPageService.onMouseDownEmptyTile(event, rowIndex, colIndex, this.selectedTileType);
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownItem(event, rowIndex, colIndex);
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        this.mapGrid = this.editPageService.onDrop(event, rowIndex, colIndex);
    }

    onMouseUp(): void {
        this.editPageService.onMouseUp();
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        if (this.isDragging) {
            return;
        }
        this.mapGrid = this.editPageService.onMouseOver(event, rowIndex, colIndex);
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        this.mapGrid = this.editPageService.onDragStart(event, rowIndex, colIndex);
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.mapGrid = this.editPageService.onDragEnd(event);
    }
}
