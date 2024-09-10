import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Map } from '@app/interfaces/map';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class CreatePageComponent implements OnInit {
    selectedMap: Map | null = null;
    mapList: Map[] = [];
    loading: boolean = true;

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit(): void {
        // TODO get the map list from the server and setLoading to false
        this.communicationService.basicGet();
    }

    onSelectMap(event: Event): void {
        const mapElement = event.target as HTMLElement;

        if (mapElement.tagName.toLowerCase() === 'span') {
            const newSelection: Map = this.mapList[parseInt(mapElement.id, 10)];
            this.selectedMap = newSelection;
        }
    }

    isSelectionValid(): boolean {
        return this.selectedMap !== null;
    }
}
