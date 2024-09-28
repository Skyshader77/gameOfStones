import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import html2canvas from 'html2canvas';
import { finalize } from 'rxjs';
import { MapAPIService } from '../map-api.service';
@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    @Output() mapValidationStatus = new EventEmitter<ValidationResult>();
    @Output() mapLoaded = new EventEmitter();
    currentMap: CreationMap = consts.DEFAULT_MAP;
    originalMap: CreationMap;
    mapId: string;
    selectedTileType: TileTerrain | null;
    modalMessage: string;

    constructor(
        private mapAPIService: MapAPIService,
        private router: Router,
    ) {}

    fetchMap(mapId: string) {
        this.mapAPIService.getMapById(mapId).subscribe((map: Map) => {
            this.currentMap = JSON.parse(JSON.stringify(map)) as CreationMap;
            this.originalMap = JSON.parse(JSON.stringify(map)) as CreationMap;
            this.mapId = map._id;
            this.mapLoaded.emit();
        });
    }

    initializeMap(size: MapSize, mode: GameMode): void {
        this.currentMap = {
            size: size,
            mode: mode,
            name: '',
            description: '',
            mapArray: Array.from({ length: size }, () => Array.from({ length: size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE }))),
            placedItems: [],
        };
        this.originalMap = JSON.parse(JSON.stringify(this.currentMap));
        this.mapId = '';
    }

    resetMap() {
        if (!this.mapId) this.initializeMap(this.currentMap.size, this.currentMap.mode);
        else this.currentMap = JSON.parse(JSON.stringify(this.originalMap));
    }

    captureMapAsImage(): void {
        const mapElement = document.querySelector('.map-container') as HTMLElement;

        html2canvas(mapElement).then((canvas) => {
            // Convert the canvas to a data URL
            const imgData = canvas.toDataURL('image/png');

            // Create a Blob from the data URL
            const blob = this.dataURLtoBlob(imgData);

            // Create a link to download the image
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'map-screenshot.png';
            link.click();

            // Clean up the object URL after the download
            URL.revokeObjectURL(url);
        });
    }

    private dataURLtoBlob(dataURL: string): Blob {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }

    getMapSize(): number {
        return this.currentMap.size;
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    getMaxItems(): number {
        switch (this.currentMap.size) {
            case MapSize.SMALL:
                return consts.SMALL_MAP_ITEM_LIMIT;
            case MapSize.MEDIUM:
                return consts.MEDIUM_MAP_ITEM_LIMIT;
            case MapSize.LARGE:
                return consts.LARGE_MAP_ITEM_LIMIT;
        }
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.currentMap.placedItems.includes(item);
        } else {
            const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
            return itemCount === this.getMaxItems();
        }
    }

    changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
        this.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            this.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
        } else {
            this.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        const item: Item = this.currentMap.mapArray[rowIndex][colIndex].item;
        this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;

        const index = this.currentMap.placedItems.indexOf(item);
        if (index !== -1) {
            this.currentMap.placedItems.splice(index, 1);
        }
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.currentMap.mapArray[rowIndex][colIndex].item = item;
        this.currentMap.placedItems.push(item);
    }

    handleSave(validationResults: ValidationStatus) {
        if (this.mapId && validationResults.isMapValid) {
            this.updateMap(validationResults);
        } else if (validationResults.isMapValid) {
            this.createMap(validationResults);
        } else this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
    }

    private updateMap(validationResults: ValidationStatus) {
        const updatedMap: Map = {
            ...this.currentMap,
            _id: this.mapId,
            isVisible: true,
            dateOfLastModification: new Date(),
        };

        this.mapAPIService
            .updateMap(updatedMap)
            .pipe(finalize(() => {}))
            .subscribe({
                next: () => {
                    this.modalMessage = 'La carte a été mise à jour!';
                    this.captureMapAsImage(); // Capture the image after a successful update
                    console.log('in next');
                    this.setRedirectionToAdmin(); // Redirect to admin after successful update
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                },
                error: (error) => {
                    this.modalMessage = error.error.error;
                },
            });
    }

    private createMap(validationResults: ValidationStatus) {
        this.mapAPIService
            .createMap(this.currentMap)
            .pipe(finalize(() => {}))
            .subscribe({
                next: () => {
                    this.modalMessage = 'La carte a été enregistrée!';
                    this.captureMapAsImage(); // Capture the image after a successful creation
                    this.setRedirectionToAdmin(); // Redirect to admin after successful creation
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                },
                error: (error) => {
                    this.modalMessage = error.error.error; // Handle error
                },
            });
    }

    private setRedirectionToAdmin() {
        const dialog = document.getElementById('editPageDialog') as HTMLDialogElement;
        if (dialog) {
            dialog.addEventListener('close', () => {
                this.router.navigate(['/admin']);
            });
        }
    }
}
