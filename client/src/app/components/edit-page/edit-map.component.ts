import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITEM_TO_STRING_MAP, TERRAIN_TO_STRING_MAP } from '@app/constants/conversion.constants';
import * as constants from '@app/constants/edit-page.constants';
import { GameMode, ItemType } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';
import { MapSize } from '@common/constants/game-map.constants';
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

    itemToStringMap = ITEM_TO_STRING_MAP;
    terrainToStringMap = TERRAIN_TO_STRING_MAP;
    itemDescriptions = constants.ITEM_DESCRIPTIONS;

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
        const currentDiv = event.target as HTMLDivElement;
        currentDiv.style.position = 'absolute';
        const element = currentDiv.parentElement as HTMLElement;
        element.removeAttribute('data-tip');
        this.mouseHandlerService.onDragStart(event, mapPosition);
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

    private onResize(): void {
        this.setTileSize();
    }

    private setTileSize(): void {
        this.tileSize =
            Math.min(window.innerHeight * constants.MAP_CONTAINER_HEIGHT_FACTOR, window.innerWidth * constants.MAP_CONTAINER_WIDTH_FACTOR) /
            this.mapManagerService.getMapSize();
    }
}
