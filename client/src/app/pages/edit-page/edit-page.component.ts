import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';
import { Item } from '@app/interfaces/map';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [RouterLink, SidebarComponent, MapComponent],
})
export class EditPageComponent {
    selectedTileType: string = '';
    mapSize: number = 20;
    placedItems: Item[] = [];

    onItemPlaced(item: Item) {
        if (!this.placedItems.includes(item)) {
            this.placedItems.push(item);
        }
    }

    onItemRemoved(item: Item) {
        const index = this.placedItems.indexOf(item);
        if (index !== -1) {
            this.placedItems.splice(index, 1);
        }
    }

    onTileTypeSelected(type: string) {
        this.selectedTileType = type;
    }

    onSelectedTileTypeChange(newSelectionType: string) {
        this.selectedTileType = newSelectionType;
    }
}
