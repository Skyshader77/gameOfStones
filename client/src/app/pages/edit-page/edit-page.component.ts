import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

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
    placedItems: string[] = [];

    onItemPlaced(item: string) {
        if (!this.placedItems.includes(item)) {
            this.placedItems.push(item);
        }
    }

    onItemRemoved(item: string) {
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
