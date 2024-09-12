import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '@app/interfaces/map';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule],
})
export class SidebarComponent {
    @Output() tileTypeSelected = new EventEmitter<string>();

    @Input() placedItems: string[] = [];
    @Input() selectedTileType: string = '';
    items = [
        { type: 'potionBlue', label: 'Potion Bleue' },
        { type: 'potionGreen', label: 'Potion Verte' },
        { type: 'potionRed', label: 'Potion Rouge' },
        { type: 'sword', label: 'Épée' },
        { type: 'armor', label: 'Armure' },
        { type: 'axe', label: 'Hache' },
        { type: 'randomItem', label: 'Item Aléatoire' },
    ];

    tiles = [
        { type: 'ice', label: 'Glace' },
        { type: 'water', label: 'Eau' },
        { type: 'closed_door', label: 'Porte' },
        { type: 'wall', label: 'Mur' },
    ];

    onDragStart(event: DragEvent, itemType: string) {
        event.dataTransfer?.setData('itemType', itemType);
    }

    selectTile(type: string) {
        this.selectedTileType = type;
        this.tileTypeSelected.emit(type);
    }

    isItemPlaced(item: string): boolean {
        return this.placedItems.includes(item);
    }

    isTileTypeSelected(tileType: string): boolean {
        return this.selectedTileType === tileType;
    }
}
