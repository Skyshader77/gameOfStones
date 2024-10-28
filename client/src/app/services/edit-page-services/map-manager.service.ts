import { EventEmitter, Injectable, Output } from '@angular/core';
import * as constants from '@app/constants/edit-page.constants';
import { CreationMap, Item, Map } from '@app/interfaces/map-mouse-event';
import { ValidationResult } from '@app/interfaces/validation';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { MAP_ITEM_LIMIT } from '@common/constants/game-map.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import * as html2canvas from 'html2canvas-pro';
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
        private modalMessageService: ModalMessageService,
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
            mapArray: Array.from({ length: size }, () => Array.from({ length: size }, () => TileTerrain.GRASS)),
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
        return MAP_ITEM_LIMIT[this.currentMap.size];
    }

    isItemLimitReached(item: ItemType): boolean {
        const isSpecialItem = item === ItemType.RANDOM || item === ItemType.START;
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem.type === item).length;
        return isSpecialItem ? itemCount >= MAP_ITEM_LIMIT[this.currentMap.size] : itemCount > 0;
    }

    getRemainingRandomAndStart(item: ItemType): number {
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem.type === item).length;
        const maxItems = this.getMaxItems();
        return maxItems - itemCount;
    }

    changeTile(mapPosition: Vec2, tileType: TileTerrain) {
        this.currentMap.mapArray[mapPosition.y][mapPosition.x] = tileType;
    }

    toggleDoor(mapPosition: Vec2) {
        const tile = this.currentMap.mapArray[mapPosition.y][mapPosition.x];
        const newTerrain = tile === TileTerrain.CLOSEDDOOR ? TileTerrain.OPENDOOR : TileTerrain.CLOSEDDOOR;
        this.changeTile(mapPosition, newTerrain);
    }

    removeItem(mapPosition: Vec2) {
        this.currentMap.placedItems = this.currentMap.placedItems.filter(
            (item: Item) => !(item.position.x === mapPosition.x && item.position.y === mapPosition.y),
        );
    }

    getItemType(mapPosition: Vec2): ItemType {
        const type = this.currentMap.placedItems.find((item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y)?.type;
        return type !== undefined ? type : ItemType.NONE;
    }

    addItem(mapPosition: Vec2, item: ItemType) {
        if (this.getItemType(mapPosition) === ItemType.NONE) {
            this.currentMap.placedItems.push({ position: mapPosition, type: item });
        }
    }

    handleSave(validationResult: ValidationResult, mapElement: HTMLElement): Observable<boolean> {
        if (!validationResult.validationStatus.isMapValid) {
            this.modalMessageService.showMessage({ title: constants.CREATION_EDITION_ERROR_TITLES.invalid, content: validationResult.message });
            return of(false);
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

    private saveMap(): Observable<boolean> {
        if (this.mapId) {
            return this.mapAPIService.getMapById(this.mapId).pipe(
                switchMap(() => this.updateMap()),
                catchError(() => this.createMap()),
            );
        } else {
            return this.createMap();
        }
    }

    private updateMap(): Observable<boolean> {
        const updatedMap: Map = {
            ...this.currentMap,
            _id: this.mapId,
            isVisible: false,
            dateOfLastModification: new Date(),
        };

        return this.mapAPIService.updateMap(this.originalMap.name === updatedMap.name, updatedMap).pipe(
            map(() => {
                this.modalMessageService.showMessage({
                    title: constants.CREATION_EDITION_ERROR_TITLES.edition,
                    content: 'Vous allez être redirigé à la fermeture de ce message',
                });
                return true;
            }),
            catchError((error: Error) => {
                this.modalMessageService.showMessage({ title: error.message, content: '' });
                return of(false);
            }),
        );
    }

    private createMap(): Observable<boolean> {
        return this.mapAPIService.createMap(this.currentMap).pipe(
            map(() => {
                this.modalMessageService.showMessage({
                    title: constants.CREATION_EDITION_ERROR_TITLES.creation,
                    content: 'Vous allez être redirigé à la fermeture de ce message',
                });
                return true;
            }),
            catchError((error: Error) => {
                this.modalMessageService.showMessage({ title: error.message, content: '' });
                return of(false);
            }),
        );
    }
}
