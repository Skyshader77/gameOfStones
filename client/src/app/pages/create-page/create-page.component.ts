import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { CommunicationService } from '@app/services/communication.service';
import { MapListService } from '@app/services/map-list.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, MapListComponent],
})
export class CreatePageComponent implements OnInit {
    mapListService: MapListService = inject(MapListService);

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit(): void {
        // TODO get the map list from the server and setLoading to false
        this.communicationService.basicGet();
    }
}
