import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { Map } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class GameMapService {
    map: Map | null = null;

    getTileDimension(): number {
        return this.map !== null ? MAP_PIXEL_DIMENSION / this.map?.size : 0;
    }
}
