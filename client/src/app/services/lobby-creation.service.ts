import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);

    private _maps: Map[];
    private selection: number;

    get selectedMap(): Map | null {
        return this.selection !== -1 ? this._maps[this.selection] : null;
    }

    get maps(): Map[] {
        return this._maps;
    }

    initialize(): void {
        this.mapAPIService.getMaps().subscribe({
            next: (maps: Map[]) => {
                this._maps = maps;
            },
        });
        this.selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index <= this._maps.length) {
            this.selection = index;
        }
    }

    isSelectionValid(): Observable<boolean> {
        if (this.selection === -1) return of(false);

        const selectedMap: Map = this._maps[this.selection];

        return this.mapAPIService.getMapbyId(selectedMap._id).pipe(
            map((serverMap: Map) => {
                return serverMap._id === selectedMap._id; // TODO && map.isVisible;
            }),
        );
    }
}
