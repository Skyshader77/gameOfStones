import { EventEmitter, Injectable, Output } from '@angular/core';
import * as constants from '@app/constants/edit-page.constants';
import { CreationMap, GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { ValidationResult } from '@app/interfaces/validation';
import { Vec2 } from '@app/interfaces/vec2';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import * as html2canvas from 'html2canvas-pro';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { catchError, map, Observable, of, Subscriber, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    @Output() mapLoaded = new EventEmitter();

    currentMap: CreationMap = constants.DEFAULT_MAP;
    selectedTileType: TileTerrain | null;

    private originalMap: CreationMap;
    private mapId: string;

    constructor(
        private mapAPIService: MapAPIService,
        private errorMessageService: ModalMessageService,
    ) {}

    fetchMap(mapId: string) {
        this.mapAPIService.getMapById(mapId).subscribe((serverMap: Map) => {
            this.currentMap = {
                size: serverMap.size,
                mode: serverMap.mode,
                name: serverMap.name,
                description: serverMap.description,
                mapArray: JSON.parse(JSON.stringify(serverMap.mapArray)),
                placedItems: JSON.parse(JSON.stringify(serverMap.placedItems)),
                imageData: '',
            };
            this.originalMap = JSON.parse(JSON.stringify(this.currentMap));
            this.mapId = serverMap._id;
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

    getMaxItems(): number {
        return constants.MAP_ITEM_LIMIT[this.currentMap.size];
    }

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

    changeTile(mapPosition: Vec2, tileType: TileTerrain) {
        this.currentMap.mapArray[mapPosition.y][mapPosition.x].terrain = tileType;
    }

    toggleDoor(mapPosition: Vec2) {
        const tile = this.currentMap.mapArray[mapPosition.y][mapPosition.x];
        const newTerrain = tile.terrain === TileTerrain.CLOSEDDOOR ? TileTerrain.OPENDOOR : TileTerrain.CLOSEDDOOR;
        this.changeTile(mapPosition, newTerrain);
    }

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

    handleSave(validationResult: ValidationResult, mapElement: HTMLElement): Observable<string> {
        if (!validationResult.validationStatus.isMapValid) {
            this.errorMessageService.showMessage({ title: constants.CREATION_EDITION_ERROR_TITLES.invalid, content: validationResult.message });
            return of('');
        } else {
            return this.captureMapAsImage(mapElement).pipe(
                switchMap(() => {
                    return this.saveMap();
                }),
            );
        }
    }

    private captureMapAsImage(mapElement: HTMLElement): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.takeScreenShot(mapElement, subscriber);
        });
    }

    private async takeScreenShot(mapElement: HTMLElement, subscriber: Subscriber<void>) {
        html2canvas.default(mapElement).then((canvas) => {
            // The call to the function here is impossible to test since it is not possible to mock html2canvas.
            // From : https://stackoverflow.com/questions/60259259/error-supportsscrollbehavior-is-not-declared-configurable/62935131#62935131
            this.updateImageData(canvas, subscriber);
        });
    }

    private updateImageData(canvas: HTMLCanvasElement, subscriber: Subscriber<void>): void {
        const imgData: string = canvas.toDataURL('image/jpeg', constants.PREVIEW_IMAGE_QUALITY);
        this.currentMap.imageData = imgData;
        subscriber.next();
        subscriber.complete();
    }

    private saveMap(): Observable<string> {
        if (this.mapId) {
            return this.mapAPIService.getMapById(this.mapId).pipe(
                switchMap(() => this.updateMap()),
                catchError(() => this.createMap()),
            );
        } else {
            return this.createMap();
        }
    }

    private updateMap(): Observable<string> {
        const updatedMap: Map = {
            ...this.currentMap,
            _id: this.mapId,
            isVisible: false,
            dateOfLastModification: new Date(),
        };

        return this.mapAPIService.updateMap(updatedMap).pipe(
            map(() => {
                return constants.CREATION_EDITION_ERROR_TITLES.edition;
            }),
            catchError((error: Error) => {
                this.errorMessageService.showMessage({ title: error.message, content: '' });
                return of('');
            }),
        );
    }

    private createMap(): Observable<string> {
        return this.mapAPIService.createMap(this.currentMap).pipe(
            map(() => {
                return constants.CREATION_EDITION_ERROR_TITLES.creation;
            }),
            catchError((error: Error) => {
                this.errorMessageService.showMessage({ title: error.message, content: '' });
                return of('');
            }),
        );
    }
}
