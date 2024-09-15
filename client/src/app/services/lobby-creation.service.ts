import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);

    private mapList: Map[];
    private selection: number;

    get selectedMap(): Map | null {
        return this.selection !== -1 ? this.mapList[this.selection] : null;
    }

    get maps(): Map[] {
        return this.mapList;
    }

    initialize(): void {
        this.mapAPIService.getMaps().subscribe({
            next: (maps: Map[]) => {
                this.mapList = maps;
            },
        });
        this.selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index <= this.mapList.length) {
            this.selection = index;
        }
    }

    isSelectionValid(): Observable<boolean> {
        if (this.selection === -1) return of(false);

        const selectedMap: Map = this.mapList[this.selection];

        return this.mapAPIService.getMapbyId(selectedMap._id).pipe(
            map((serverMap: Map) => {
                return serverMap._id === selectedMap._id; // TODO && map.isVisible;
            }),
        );
    }
}
