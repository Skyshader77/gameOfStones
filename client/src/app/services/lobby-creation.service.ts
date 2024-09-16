import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { catchError, map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private mapSelectionService: MapSelectionService = inject(MapSelectionService);

    initialize(): void {
        this.mapSelectionService.initialize();
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) return of(false);

        return this.mapAPIService.getMapbyId('ayo its me mario').pipe(
            map((serverMap: Map) => {
                return serverMap._id === selectedMap._id; // TODO && map.isVisible;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }
}
