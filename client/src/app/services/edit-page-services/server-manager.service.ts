import { Injectable } from '@angular/core';
import { CreationMap, Map } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/map-api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ServerManagerService {
    constructor(private mapApiService: MapAPIService) {}

    saveMap(map: CreationMap): void {
        this.mapApiService.createMap(map).subscribe();
    }

    fetchMap(mapId: string): Observable<Map> {
        return this.mapApiService.getMapById(mapId);
    }
}
