import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapListService {
    selectedMap: Map | null = null;
    mapList: Map[] = [];

    chooseSelectedMap(index: number): void {
        if (index <= this.mapList.length) {
            const newSelection: Map = this.mapList[index];
            this.selectedMap = newSelection;
        }
    }

    isSelectionValid(): boolean {
        return this.selectedMap !== null;
    }

    getSelectedDescription(): string | undefined {
        return this.selectedMap?.description;
    }
}
