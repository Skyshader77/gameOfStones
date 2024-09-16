import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    LARGE_MAP_ITEM_LIMIT,
    LARGE_MAP_SIZE,
    MEDIUM_MAP_ITEM_LIMIT,
    MEDIUM_MAP_SIZE,
    SMALL_MAP_ITEM_LIMIT,
    SMALL_MAP_SIZE,
} from '@app/constants/edit-page-consts';
import { GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { EditPageService } from '../../services/edit-page.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink],
})
export class SidebarComponent {
    @Output() tileTypeSelected = new EventEmitter<TileTerrain>();

    @Input() placedItems: Item[] = [];
    @Input() selectedTileType: TileTerrain | null;
    @Input() gameMode: GameMode;
    @Input() mapSize: number;
    GameMode = GameMode;

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

    constructor(protected editPageService: EditPageService) {}

    getRemainingItems(item: Item): number {
        const itemCount = this.placedItems.filter((placedItem) => placedItem === item).length;

        let maxItems = 0;
        switch (this.mapSize) {
            case SMALL_MAP_SIZE:
                maxItems = SMALL_MAP_ITEM_LIMIT;
                break;
            case MEDIUM_MAP_SIZE:
                maxItems = MEDIUM_MAP_ITEM_LIMIT;
                break;
            case LARGE_MAP_SIZE:
                maxItems = LARGE_MAP_ITEM_LIMIT;
                break;
        }

        return maxItems - itemCount;
    }

    onDragStart(event: DragEvent, itemType: Item) {
        event.dataTransfer?.setData('itemType', this.editPageService.convertItemToString(itemType));
    }

    selectTile(type: TileTerrain) {
        this.selectedTileType = type;
        this.tileTypeSelected.emit(type);
    }

    isTileTypeSelected(tileType: TileTerrain): boolean {
        return this.selectedTileType === tileType;
    }

    onResetClicked() {
        this.editPageService.resetMap();
    }
}
