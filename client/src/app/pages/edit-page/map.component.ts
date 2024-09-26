import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
import * as consts from '@app/constants/edit-page-consts';
import { Item } from '@app/interfaces/map';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MouseHandlerService } from '@app/services/edit-page-services/mouse-handler.service';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent implements OnInit {
    tileSize: number;
    item = Item;
    itemToStringMap = itemToStringMap;
    terrainToStringMap = terrainToStringMap;

    constructor(
        protected mapManagerService: MapManagerService,
        protected mouseHandlerService: MouseHandlerService,
    ) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.mouseHandlerService.onDragEnd(event);
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    ngOnInit() {
        this.tileSize = (window.innerHeight * consts.MAP_CONTAINER_HEIGHT_FACTOR) / this.mapManagerService.getMapSize();
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
        this.mouseHandlerService.onDragStart(event, rowIndex, colIndex);
    }

    fullClickOnItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.mouseHandlerService.fullClickOnItem(event, rowIndex, colIndex);
    }
}
