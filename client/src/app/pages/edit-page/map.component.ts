import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tile, Item, TileTerrain } from '@app/interfaces/map'; 

// interface Tile {
//     tileType: string;
//     item: string | null;
// }

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent {
    @Input() size: number = 20;
    @Input() selectedTileType: TileTerrain | null;

    @Output() selectedTileTypeChange = new EventEmitter<TileTerrain>();
    @Output() itemPlaced = new EventEmitter<Item>();
    @Output() itemRemoved = new EventEmitter<Item>();

    mapGrid: Tile[][] = [];

    tileSize: number = (window.innerHeight * 0.95) / this.size;
    isLeftClick: boolean = false;
    isRightClick: boolean = false;
    wasItemDeleted: boolean = false;

    ngOnInit() {
        this.initializeMap();
    }

    initializeMap() {
        this.mapGrid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })));
    }

    hasItemPlaced(item: Item): boolean {
        return this.mapGrid.some((row) => row.some((tile) => tile.item === item));
    }

    onMouseDown(event: MouseEvent, rowIndex: number, colIndex: number): void {
        console.log("Value of deleted item: " + this.wasItemDeleted );
        event.preventDefault();
        this.isRightClick = event.button === 2;
        this.isLeftClick = event.button === 0;
        if (this.mapGrid[rowIndex][colIndex].item && this.isRightClick) {
            this.wasItemDeleted = true; // Mark that an item was deleted
            this.itemRemoved.emit(this.mapGrid[rowIndex][colIndex].item || undefined);
            this.removeItem(rowIndex, colIndex);
        } else if (this.isRightClick && !this.wasItemDeleted) {
            console.log("Right click, no item");
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
        if (itemType && !this.hasItemPlaced(this.convertStringToItem(itemType))) {
            this.mapGrid[rowIndex][colIndex].item = this.convertStringToItem(itemType);
            this.itemPlaced.emit(this.convertStringToItem(itemType));
        }
    }

    onMouseUp(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.isLeftClick = false;
        this.isRightClick = false;
        this.wasItemDeleted = false;
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        if (event.buttons === 1 && this.selectedTileType) {
            this.changeTile(rowIndex, colIndex); // Add tile type while mouse is held down
        } else if (event.buttons === 2 && !this.wasItemDeleted) {
            this.revertTileToGrass(rowIndex, colIndex);
        }
    }

    changeTile(rowIndex: number, colIndex: number) {
            if (this.selectedTileType) {
                this.mapGrid[rowIndex][colIndex].terrain = this.selectedTileType; // Update the tile with the selected type
            }
    }

    removeItem(rowIndex: number, colIndex: number) {
            this.mapGrid[rowIndex][colIndex].item = Item.NONE;
    }

    revertTileToGrass(rowIndex: number, colIndex: number): void {
        console.log("Tile reverted to grass");
            this.mapGrid[rowIndex][colIndex].terrain = TileTerrain.GRASS; // Assuming 'grass' is the default type
    }

    convertStringToItem(str: String): Item {
        switch(str) {
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
        switch(item) {
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
    switch(terrain) {
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
    }
    return '';
}
}
