import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Item } from '@app/interfaces/map';
import * as CONSTS from '../../constants/edit-page-consts';
import { DataConversionService } from '../../services/data-conversion.service';
import { EditPageService } from '../../services/edit-page.service';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [CommonModule],
})
export class MapComponent implements OnInit {
    tileSize: number;
    Item = Item;
    convertItemToString = this.dataConversionService.convertItemToString;
    convertTerrainToString = this.dataConversionService.convertTerrainToString;

    constructor(
        protected editPageService: EditPageService,
        protected dataConversionService: DataConversionService,
    ) {}

    preventRightClick(event: MouseEvent): void {
        event.preventDefault(); // Prevent the context menu from appearing
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // Necessary to allow dropping
    }

    ngOnInit() {
        this.tileSize = (window.innerHeight * CONSTS.MAP_CONTAINER_HEIGHT_FACTOR) / this.editPageService.currentMap.rowSize;
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

    @HostListener('document:dragend', ['$event'])
    onDragEnd(event: DragEvent): void {
        this.editPageService.onDragEnd(event);
    }
}
