import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TileTerrain, Item } from '@app/interfaces/map';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule],
})
export class SidebarComponent {
    @Output() tileTypeSelected = new EventEmitter<TileTerrain>();

    @Input() placedItems: Item[] = [];
    @Input() selectedTileType: TileTerrain | null;
    
    items = [
        { type: Item.BOOST1, label: 'Potion Bleue' },
        { type: Item.BOOST2, label: 'Potion Verte' },
        { type: Item.BOOST3, label: 'Potion Rouge' },
        { type: Item.BOOST4, label: 'Épée' },
        { type: Item.BOOST5, label: 'Armure' },
        { type: Item.BOOST6, label: 'Hache' },
        { type: Item.RANDOM, label: 'Item Aléatoire' },
        { type: Item.START, label: 'Point de départ' },
        { type: Item.FLAG, label: 'Drapeau' },
    ];

    tiles = [
        { type: 'ice', label: 'Glace' },
        { type: 'water', label: 'Eau' },
        { type: 'closed_door', label: 'Porte' },
        { type: 'wall', label: 'Mur' },
    ];

    onDragStart(event: DragEvent, itemType: Item) {
        event.dataTransfer?.setData('itemType', itemType.toString());
    }

    selectTile(type: TileTerrain) {
        this.selectedTileType = type;
        this.tileTypeSelected.emit(type);
    }

    isItemPlaced(item: Item): boolean {
        return this.placedItems.includes(item);
    }

    isTileTypeSelected(tileType: TileTerrain): boolean {
        return this.selectedTileType === tileType;
    }

    convertStringToTerrain(str: String): TileTerrain {
        switch(str) {
            case 'grass': {
                return TileTerrain.GRASS;
            }
            case 'ice': {
                return TileTerrain.ICE;
            }
            case 'water': {
                return TileTerrain.WATER;
            }
            case 'closed_door': {
                return TileTerrain.CLOSEDDOOR;
            }
            case 'wall': {
                return TileTerrain.WALL;
            }
    }
    return TileTerrain.GRASS;
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
}
