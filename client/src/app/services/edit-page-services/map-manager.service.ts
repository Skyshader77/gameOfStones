import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as constants from '@app/constants/edit-page.constants';
import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import { Vec2 } from '@app/interfaces/vec2';
import { MapAPIService } from '@app/services/map-api.service';
import html2canvas from 'html2canvas-pro';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    @Output() mapValidationStatus = new EventEmitter<ValidationResult>();
    @Output() mapLoaded = new EventEmitter();

    currentMap: CreationMap = constants.DEFAULT_MAP;
    selectedTileType: TileTerrain | null;

    private originalMap: CreationMap;
    private modalMessage: string;
    private mapId: string;

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

    getMapSize(): number {
        return this.currentMap.size;
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    /*  getMaxItems(): number {
        switch (this.currentMap.size) {
            case MapSize.SMALL:
                return constants.SMALL_MAP_ITEM_LIMIT;
            case MapSize.MEDIUM:
                return constants.MEDIUM_MAP_ITEM_LIMIT;
            case MapSize.LARGE:
                return constants.LARGE_MAP_ITEM_LIMIT;
        }
    } */
    getMaxItems(): number {
        const mapItemLimits = {
            [MapSize.SMALL]: constants.SMALL_MAP_ITEM_LIMIT,
            [MapSize.MEDIUM]: constants.MEDIUM_MAP_ITEM_LIMIT,
            [MapSize.LARGE]: constants.LARGE_MAP_ITEM_LIMIT,
        };

        return mapItemLimits[this.currentMap.size];
    }

    /* isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.currentMap.placedItems.includes(item);
        } else {
            const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
            return itemCount === this.getMaxItems();
        }
    } */
    isItemLimitReached(item: Item): boolean {
        const isSpecialItem = item === Item.RANDOM || item === Item.START;

        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;

        return isSpecialItem ? itemCount === this.getMaxItems() : itemCount > 0;
    }

    getRemainingRandomAndStart(item: Item): number {
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
        const maxItems = this.getMaxItems();
        return maxItems - itemCount;
    }

    // changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
    //     this.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
    // }

    changeTile(mapPosition: Vec2, tileType: TileTerrain) {
        this.currentMap.mapArray[mapPosition.y][mapPosition.x].terrain = tileType;
    }

    // toggleDoor(rowIndex: number, colIndex: number) {
    //     const tile = this.currentMap.mapArray[rowIndex][colIndex];
    //     if (tile.terrain === TileTerrain.CLOSEDDOOR) {
    //         this.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
    //     } else {
    //         this.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
    //     }
    // }

    /* toggleDoor(mapPosition: Vec2) {
        const tile = this.currentMap.mapArray[mapPosition.y][mapPosition.x];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            this.changeTile(mapPosition, TileTerrain.OPENDOOR);
        } else {
            this.changeTile(mapPosition, TileTerrain.CLOSEDDOOR);
        }
    } */
    toggleDoor(mapPosition: Vec2) {
        const tile = this.currentMap.mapArray[mapPosition.y][mapPosition.x];
        const newTerrain = tile.terrain === TileTerrain.CLOSEDDOOR ? TileTerrain.OPENDOOR : TileTerrain.CLOSEDDOOR;
        this.changeTile(mapPosition, newTerrain);
    }

    // removeItem(rowIndex: number, colIndex: number) {
    //     const item: Item = this.currentMap.mapArray[rowIndex][colIndex].item;
    //     this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;

    //     const index = this.currentMap.placedItems.indexOf(item);

    //     this.currentMap.placedItems.splice(index, 1);
    // }
    removeItem(mapPosition: Vec2) {
        const item: Item = this.currentMap.mapArray[mapPosition.y][mapPosition.x].item;
        this.currentMap.mapArray[mapPosition.y][mapPosition.x].item = Item.NONE;
        const index = this.currentMap.placedItems.indexOf(item);
        this.currentMap.placedItems.splice(index, 1);
    }

    addItem(mapPosition: Vec2, item: Item) {
        this.currentMap.mapArray[mapPosition.y][mapPosition.x].item = item;
        this.currentMap.placedItems.push(item);
    }

    /*  async handleSave(validationResults: ValidationStatus) {
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
        } else {
            this.modalMessage = 'La carte est invalide.';
            this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
        }
    } */

    async handleSave(validationResults: ValidationStatus) {
        if (!validationResults.isMapValid) {
            this.modalMessage = 'La carte est invalide.';
            return this.mapValidationStatus.emit({ validationStatus: validationResults, message: this.modalMessage });
        }

        await this.captureMapAsImage();

        if (this.mapId) {
            this.mapAPIService.getMapById(this.mapId).subscribe({
                next: () => this.updateMap(validationResults),
                error: () => this.createMap(validationResults),
            });
        } else {
            this.createMap(validationResults);
        }
    }

    private async captureMapAsImage(): Promise<void> {
        const mapElement = document.querySelector('.map-container') as HTMLElement;

        await html2canvas(mapElement).then((canvas) => {
            const imgData: string = canvas.toDataURL('image/jpeg', constants.PREVIEW_IMAGE_QUALITY);
            this.currentMap.imageData = imgData;
        });
    }

    private updateMap(validationResults: ValidationStatus) {
        const updatedMap: Map = {
            ...this.currentMap,
            _id: this.mapId,
            isVisible: false,
            dateOfLastModification: new Date(),
        };

        this.mapAPIService
            .updateMap(updatedMap)
            .pipe()
            .subscribe({
                next: () => {
                    this.modalMessage = 'La carte a été mise à jour !';
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
                    this.modalMessage = 'La carte a été enregistrée !';

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
