import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapListService {
    private _selectedMap: Map | null = null;
    private _mapList: Map[] = [];

    chooseSelectedMap(index: number): void {
        const newSelection: Map = this._mapList[index];
        this._selectedMap = newSelection;
    }

    isSelectionValid(): boolean {
        return this._selectedMap !== null;
    }

    get selectedMap(): Map | null {
        return this._selectedMap;
    }

    get mapList(): Map[] {
        return this._mapList;
    }
}
