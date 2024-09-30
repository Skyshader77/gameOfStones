import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import { MapAPIService } from '@app/services/map-api.service';
import html2canvas from 'html2canvas-pro';
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
            this.currentMap = {
                size: map.size,
                mode: map.mode,
                name: map.name,
                description: map.description,
                mapArray: JSON.parse(JSON.stringify(map.mapArray)),
                placedItems: JSON.parse(JSON.stringify(map.placedItems)),
                imageData: '',
            };
            this.originalMap = JSON.parse(JSON.stringify(this.currentMap));
            this.mapId = map._id;
            this.mapLoaded.emit();
        });
    }

    initializeMap(size: MapSize, mode: GameMode): void {
        this.currentMap = {
            size,
            mode,
            name: '',
            description: '',
            mapArray: Array.from({ length: size }, () => Array.from({ length: size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE }))),
            placedItems: [],
            imageData: '',
        };
        this.originalMap = JSON.parse(JSON.stringify(this.currentMap));
        this.mapId = '';
    }

    resetMap() {
        if (!this.mapId) this.initializeMap(this.currentMap.size, this.currentMap.mode);
        else this.currentMap = JSON.parse(JSON.stringify(this.originalMap));
    }

    async captureMapAsImage(): Promise<void> {
        const mapElement = document.querySelector('.map-container') as HTMLElement;

        await html2canvas(mapElement).then((canvas) => {
            const resolution = 0.3;
            const imgData: string = canvas.toDataURL('image/jpeg', resolution);
            this.currentMap.imageData = imgData;

            // Create a temporary link element
            const link = document.createElement('a');

            // Set the download attribute with a file name (e.g., screenshot.png)
            link.download = 'screenshot.png';

            // Set the href attribute to the image data
            link.href = imgData;

            // Append the link to the document (this is needed for some browsers)
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Remove the link from the document after the download is triggered
            document.body.removeChild(link);
        });
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

    getRemainingRandomAndStart(item: Item): number {
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
        const maxItems = this.getMaxItems();
        return maxItems - itemCount;
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

        this.currentMap.placedItems.splice(index, 1);
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.currentMap.mapArray[rowIndex][colIndex].item = item;
        this.currentMap.placedItems.push(item);
    }

    async handleSave(validationResults: ValidationStatus) {
        if (validationResults.isMapValid) {
            await this.captureMapAsImage();
            if (this.mapId) {
                this.mapAPIService.getMapById(this.mapId).subscribe(
                    () => {
                        this.updateMap(validationResults);
                    },
                    () => this.createMap(validationResults),
                );
            } else {
                this.createMap(validationResults);
            }
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
            .pipe()
            .subscribe({
                next: () => {
                    this.modalMessage = 'La carte a été mise à jour!';
                    this.setRedirectionToAdmin();
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                },
                error: (error: Error) => {
                    this.modalMessage = error.message;
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                },
            });
    }

    private createMap(validationResults: ValidationStatus) {
        this.mapAPIService
            .createMap(this.currentMap)
            .pipe()
            .subscribe({
                next: () => {
                    this.modalMessage = 'La carte a été enregistrée!';

                    this.setRedirectionToAdmin();
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
                },
                error: (error: Error) => {
                    this.modalMessage = error.message;
                    this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
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
