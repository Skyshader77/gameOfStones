import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import * as consts from '@app/constants/edit-page-consts';
import { Item } from '@app/interfaces/map';
import { DataConversionService } from '@app/services/data-conversion.service';
import { EditPageService } from '@app/services/edit-page.service';

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
    convertItemToString = this.dataConversionService.convertItemToString;
    convertTerrainToString = this.dataConversionService.convertTerrainToString;

    constructor(
        protected editPageService: EditPageService,
        protected dataConversionService: DataConversionService,
    ) {}

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.editPageService.onDragEnd(event);
    }

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    ngOnInit() {
        this.tileSize = (window.innerHeight * consts.MAP_CONTAINER_HEIGHT_FACTOR) / this.editPageService.currentMap.size;
    }

    onMouseDownEmptyTile(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownEmptyTile(event, rowIndex, colIndex);
    }

    onMouseDownItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseDownItem(event, rowIndex, colIndex);
    }

    onDrop(event: DragEvent, rowIndex: number, colIndex: number) {
        this.editPageService.onDrop(event, rowIndex, colIndex);
    }

    onMouseUp(): void {
        this.editPageService.onMouseUp();
    }

    onMouseOver(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onMouseOver(event, rowIndex, colIndex);
    }

    onDragStart(event: DragEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.onDragStart(event, rowIndex, colIndex);
    }

    fullClickOnItem(event: MouseEvent, rowIndex: number, colIndex: number): void {
        this.editPageService.fullClickOnItem(event, rowIndex, colIndex);
    }
}
