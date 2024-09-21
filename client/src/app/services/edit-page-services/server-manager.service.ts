import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/map-api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ServerManagerService {
    constructor(private mapApiService: MapAPIService) {}

    saveMap(mapId: string): void {
        if (mapId) {
            this.mapApiService.getMapById(mapId).subscribe((map) => {
                this.mapApiService.updateMap(mapId, map);
            });
        }
    }

    fetchMap(mapId: string): Observable<Map> {
        return this.mapApiService.getMapById(mapId);
    }
}
