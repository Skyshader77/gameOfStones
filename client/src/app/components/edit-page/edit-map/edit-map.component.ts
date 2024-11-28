import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITEM_PATHS, TILE_PATHS } from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { MapManagerService } from '@app/services/edit-page-services/map-manager/map-manager.service';
import { MapMouseHandlerService } from '@app/services/edit-page-services/map-mouse-handler/map-mouse-handler.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { Vec2 } from '@common/interfaces/vec2';

@Component({
    selector: 'app-edit-map',
    standalone: true,
    templateUrl: './edit-map.component.html',
    styleUrls: ['./edit-map.component.css'],
    imports: [CommonModule],
})
export class EditMapComponent implements OnInit, OnDestroy {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    item = ItemType;

    tileSize: number;

    itemPaths = ITEM_PATHS;
    tilePaths = TILE_PATHS;

    itemDescriptions = constants.ITEM_DESCRIPTIONS;

    constructor(
        private mapManagerService: MapManagerService,
        private mouseHandlerService: MapMouseHandlerService,
        private route: ActivatedRoute,
    ) {}

    get mapArray() {
        return this.mapManagerService.currentMap.mapArray;
    }

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.mouseHandlerService.onDragEnd(event);
    }

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        if (!mapId) {
            this.creationInit();
        } else {
            this.editionInit(mapId);
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault();
    }

    fullClickOnItem(mapPosition: Vec2): void {
        this.mouseHandlerService.fullClickOnItem(mapPosition);
    }

    onDrop(event: DragEvent, mapPosition: Vec2) {
        this.mouseHandlerService.onDrop(event, mapPosition);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onDragStart(event: DragEvent, mapPosition: Vec2): void {
        this.mouseHandlerService.onDragStart(event, mapPosition);
    }

    getItemPositionAttribute(position: Vec2) {
        return this.isItemDragged(position) ? constants.ITEM_HOVER_POSITION : '';
    }

    isItemDragged(position: Vec2): boolean {
        return this.mouseHandlerService.draggedItemPosition?.x === position.x && this.mouseHandlerService.draggedItemPosition?.y === position.y;
    }

    onMouseUp(): void {
        this.mouseHandlerService.onMouseUp();
    }

    onMouseOver(event: MouseEvent, mapPosition: Vec2): void {
        this.mouseHandlerService.onMouseOver(event, mapPosition);
    }

    onMouseDownItem(event: MouseEvent, mapPosition: Vec2): void {
        this.mouseHandlerService.onMouseDownItem(event, mapPosition);
    }

    onMouseDownEmptyTile(event: MouseEvent, mapPosition: Vec2): void {
        this.mouseHandlerService.onMouseDownEmptyTile(event, mapPosition);
    }

    getItemDescription(item: ItemType | null): string | null {
        return item !== null ? this.itemDescriptions[item] : null;
    }

    getItemPath(item: ItemType | null): string | null {
        return item !== null ? this.itemPaths[item] : null;
    }

    getItemType(position: Vec2): ItemType | null {
        return this.mapManagerService.getItemType(position);
    }

    private onResize(): void {
        this.setTileSize();
    }

    private setTileSize(): void {
        this.tileSize =
            Math.min(window.innerHeight * constants.MAP_CONTAINER_HEIGHT_FACTOR, window.innerWidth * constants.MAP_CONTAINER_WIDTH_FACTOR) /
            this.mapManagerService.getMapSize();
    }

    private creationInit() {
        this.route.queryParams.subscribe((params) => {
            const size: MapSize = parseInt(params['size'], constants.RADIX);
            const mode: GameMode = parseInt(params['mode'], constants.RADIX);
            this.mapManagerService.initializeMap(size, mode);
            this.initMap();
        });
    }

    private editionInit(mapId: string) {
        this.mapManagerService.fetchMap(mapId);
        this.mapManagerService.mapLoaded.subscribe(() => {
            this.initMap();
        });
    }

    private initMap() {
        this.setTileSize();
        window.addEventListener('resize', this.onResize.bind(this));
    }
}
