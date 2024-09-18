import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { DataConversionService } from '@app/services/data-conversion.service';
import { EditPageService } from '@app/services/edit-page.service';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [CommonModule, RouterLink],
})
export class SidebarComponent {
    gameMode = GameMode;
    convertItemToString = this.dataConversionService.convertItemToString;
    convertStringToTerrain = this.dataConversionService.convertStringToTerrain;
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

    constructor(
        protected editPageService: EditPageService,
        protected dataConversionService: DataConversionService,
    ) {}

    getRemainingItems(item: Item): number {
        const itemCount = this.editPageService.currentMap.placedItems.filter((placedItem) => placedItem === item).length;

        const maxItems = this.editPageService.getMaxItems();

        return maxItems - itemCount;
    }

    onDragStart(event: DragEvent, itemType: Item) {
        event.dataTransfer?.setData('itemType', this.dataConversionService.convertItemToString(itemType));
        this.editPageService.selectTileType(null);
    }

    selectTile(type: TileTerrain) {
        this.editPageService.selectTileType(type);
    }

    isTileTypeSelected(tileType: TileTerrain): boolean {
        return this.editPageService.selectedTileType === tileType;
    }

    onResetClicked() {
        this.editPageService.resetMap();
    }
}
