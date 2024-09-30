import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
import * as consts from '@app/constants/edit-page-consts';
import { GameMode, Item, MapSize } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent implements OnInit, OnDestroy {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    tileSize: number;
    item = Item;
    itemToStringMap = itemToStringMap;
    terrainToStringMap = terrainToStringMap;
    itemDescriptions = consts.ITEM_DESCRIPTIONS;

    constructor(
        protected mapManagerService: MapManagerService,
        protected mouseHandlerService: MouseHandlerService,
        private route: ActivatedRoute,
    ) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.mouseHandlerService.onDragEnd(event);
    }

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        if (!mapId) {
            this.route.queryParams.subscribe((params) => {
                const size: MapSize = parseInt(params['size'], 10);
                const mode: GameMode = parseInt(params['mode'], 10);
                this.mapManagerService.initializeMap(size, mode);
                this.setTileSize();
                window.addEventListener('resize', this.onResize.bind(this));
            });
        } else {
            this.mapManagerService.fetchMap(mapId);
            this.mapManagerService.mapLoaded.subscribe(() => {
                this.setTileSize();
                window.addEventListener('resize', this.onResize.bind(this));
            });
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
    }

    onResize(): void {
        this.setTileSize();
    }

    setTileSize(): void {
        this.tileSize =
            Math.min(window.innerHeight * consts.MAP_CONTAINER_HEIGHT_FACTOR, window.innerWidth * consts.MAP_CONTAINER_WIDTH_FACTOR) /
            this.mapManagerService.getMapSize();
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault();
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mouseHandlerService.onMouseDownEmptyTile(event, rowIndex, colIndex);
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mouseHandlerService.onMouseDownItem(event, rowIndex, colIndex);
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        this.mouseHandlerService.onDrop(event, rowIndex, colIndex);
    }

    onMouseUp(): void {
        this.mouseHandlerService.onMouseUp();
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mouseHandlerService.onMouseOver(event, rowIndex, colIndex);
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        const currentDiv = event.target as HTMLDivElement;
        currentDiv.style.position = 'absolute';
        const element = currentDiv.parentElement as HTMLElement;
        element.removeAttribute('data-tip');
        this.mouseHandlerService.onDragStart(event, rowIndex, colIndex);
    }

    fullClickOnItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mouseHandlerService.fullClickOnItem(event, rowIndex, colIndex);
    }
}
