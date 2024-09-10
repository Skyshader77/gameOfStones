import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class CreatePageComponent {
    selectedMap: string = ''; // TODO change to the map type
    mapList: string[];
    loading: boolean = true;

    constructor() {
        // TODO fetch the map list from the server.
        // Only display the visible ones.
        this.mapList = [];
    }

    onSelectMap(event: Event): void {
        const mapElement = event.target as HTMLElement;

        if (mapElement.tagName.toLowerCase() === 'span') {
            this.selectedMap = mapElement.innerText;
        }
    }

    isSelectionValid(): boolean {
        return this.selectedMap !== '';
    }
}
