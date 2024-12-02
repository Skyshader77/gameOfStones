import { EventEmitter, Injectable, Output } from '@angular/core';
import * as constants from '@app/constants/edit-page.constants';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { ValidationResult } from '@app/interfaces/validation';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { RenderingService } from '@app/services/rendering-services/rendering/rendering.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { MAP_ITEM_LIMIT } from '@common/constants/game-map.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { CreationMap, Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

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
        private renderingService: RenderingService,
        private gameMapService: GameMapService,
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
            mapArray: Array.from({ length: size }, () => Array.from({ length: size }, () => TileTerrain.Grass)),
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
        const isSpecialItem = item === ItemType.Random || item === ItemType.Start;
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem.type === item).length;
        return isSpecialItem ? itemCount >= MAP_ITEM_LIMIT[this.currentMap.size] : itemCount > 0;
    }

    getRemainingStart(item: ItemType): number {
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem.type === item).length;
        const maxItems = this.getMaxItems();
        return maxItems - itemCount;
    }

    getRemainingRandom(): number {
        const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem.type !== ItemType.Start).length;
        const maxItems = this.getMaxItems();
        return maxItems - itemCount;
    }

    changeTile(mapPosition: Vec2, tileType: TileTerrain) {
        this.currentMap.mapArray[mapPosition.y][mapPosition.x] = tileType;
    }

    getTileAtPosition(position: Vec2): TileTerrain {
        return this.currentMap?.mapArray[position.y]?.[position.x];
    }

    toggleDoor(mapPosition: Vec2) {
        const tile = this.currentMap.mapArray[mapPosition.y][mapPosition.x];
        const newTerrain = tile === TileTerrain.ClosedDoor ? TileTerrain.OpenDoor : TileTerrain.ClosedDoor;
        this.changeTile(mapPosition, newTerrain);
    }

    removeItem(mapPosition: Vec2) {
        this.currentMap.placedItems = this.currentMap.placedItems.filter(
            (item: Item) => !(item.position.x === mapPosition.x && item.position.y === mapPosition.y),
        );
    }

    getItemType(mapPosition: Vec2): ItemType | null {
        return this.currentMap.placedItems.find((item) => item.position.x === mapPosition.x && item.position.y === mapPosition.y)?.type ?? null;
    }

    addItem(mapPosition: Vec2, item: ItemType) {
        if (this.getItemType(mapPosition) === null) {
            this.currentMap.placedItems.push({ position: mapPosition, type: item });
        }
    }

    handleSave(validationResult: ValidationResult, ctx: CanvasRenderingContext2D): Observable<boolean> {
        if (!validationResult.validationStatus.isMapValid) {
            this.modalMessageService.showMessage({ title: constants.CREATION_EDITION_ERROR_TITLES.invalid, content: validationResult.message });
            return of(false);
        } else {
            this.takeScreenShot(ctx);
            return this.saveMap();
        }
    }

    getItemAtPosition(position: Vec2) {
        return this.currentMap.placedItems.find((item) => item.position.x === position.x && item.position.y === position.y);
    }

    private takeScreenShot(ctx: CanvasRenderingContext2D) {
        this.gameMapService.map = { ...this.currentMap, isVisible: false, dateOfLastModification: new Date(), _id: '' };
        this.gameMapService.mapPixelDimension = ctx.canvas.width;
        const screenshotData = this.renderingService.renderScreenshot(ctx);
        this.currentMap.imageData = screenshotData;
        this.gameMapService.mapPixelDimension = MAP_PIXEL_DIMENSION;
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
                    content: constants.SUCCESS_MESSAGE,
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
                    content: constants.SUCCESS_MESSAGE,
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
