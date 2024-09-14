import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { MapListService } from '@app/services/map-list.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, MapListComponent],
})
export class CreatePageComponent {
    mapListService: MapListService = inject(MapListService);
}
