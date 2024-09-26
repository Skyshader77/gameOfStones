import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { catchError, map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
import { MapListService } from './map-list.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private mapSelectionService: MapSelectionService = inject(MapSelectionService);
    private mapListService: MapListService = inject(MapListService);
    initialize(): void {
        this.mapListService.initialize();
        this.mapSelectionService.initialize();
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) return of(false);

        return this.mapAPIService.getMapbyId(selectedMap._id).pipe(
            map((response) => {
                return true; // TODO && map.isVisible;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }
}
