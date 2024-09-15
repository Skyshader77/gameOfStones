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

    constructor(private editPageService: EditPageService) {}

    ngOnInit() {
        this.tileSize = (window.innerHeight * CONSTS.MAP_CONTAINER_HEIGHT_FACTOR) / this.size;
        this.mapGrid = this.editPageService.initializeMap(this.size);
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.placedItems.includes(item);
        } else {
            const itemCount = this.placedItems.filter((placedItem) => placedItem === item).length;
            switch (this.size) {
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

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log('mouseDownEmpty');
        this.mapGrid = this.editPageService.onMouseDownEmptyTile(event, rowIndex, colIndex, this.selectedTileType);
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownItem(event, rowIndex, colIndex);
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
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

    changeTile(rowIndex: number, colIndex: number) {
        if (this.selectedTileType) {
            this.mapGrid[rowIndex][colIndex].terrain = this.selectedTileType; // Update the tile with the selected type
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        this.itemRemoved.emit(this.mapGrid[rowIndex][colIndex].item);
        this.mapGrid[rowIndex][colIndex].item = Item.NONE;
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        this.mapGrid[rowIndex][colIndex].terrain = TileTerrain.GRASS; // Assuming 'grass' is the default type
    }

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
