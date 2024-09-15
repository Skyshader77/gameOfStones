import { Component, inject } from '@angular/core';
import { LobbyCreationService } from '@app/services/lobby-creation.service';

@Component({
    selector: 'app-map-list',
    standalone: true,
    imports: [],
    templateUrl: './map-list.component.html',
})
export class MapListComponent {
    loading: boolean = false;

    createPageService: LobbyCreationService = inject(LobbyCreationService);

    onSelectMap(event: MouseEvent): void {
        const element: HTMLElement = event.target as HTMLElement;
        if (element.tagName.toLowerCase() === 'span') {
            this.createPageService.chooseSelectedMap(parseInt(element.id.substring('map'.length), 10));
        }
    }
}
