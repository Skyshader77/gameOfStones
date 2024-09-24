import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    map: Map | null;
}
