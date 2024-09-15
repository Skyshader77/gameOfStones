import { Component } from '@angular/core';
import { GameMode, Item, TileTerrain } from '@app/interfaces/map';
import * as CONSTS from '../../constants/edit-page-consts';
import { EditPageService } from '../../services/edit-page.service';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent],
})
export class EditPageComponent {
    selectedTileType: TileTerrain;
    mapSize: number = CONSTS.MAP_SIZE_TEMP;
    placedItems: Item[] = [];
    gameMode: GameMode = GameMode.CTF;

    constructor(private editPageService: EditPageService) {}

    ngOnInit() {
        this.editPageService.itemRemoved$.subscribe((item) => {
            this.onItemRemoved(item);
        });
        this.editPageService.itemAdded$.subscribe((item) => {
            this.onItemPlaced(item);
        });
    }
    onItemPlaced(item: Item) {
        this.placedItems.push(item);
    }

    onItemRemoved(item: Item) {
        const index = this.placedItems.indexOf(item);
        if (index !== -1) {
            this.placedItems.splice(index, 1);
        }
    }

    onTileTypeSelected(type: TileTerrain) {
        this.selectedTileType = type;
    }

    onSelectedTileTypeChange(newSelectionType: TileTerrain) {
        this.selectedTileType = newSelectionType;
    }
}
