import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RASTER_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map';
import { Vec2 } from '@app/interfaces/vec2';
import { RenderingService } from '@app/services/rendering.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [],
    templateUrl: './map.component.html',
})
export class MapComponent implements AfterViewInit, OnDestroy {
    @Output() clickEvent = new EventEmitter<MapMouseEvent>();
    @Output() overEvent = new EventEmitter<MapMouseEvent>();
    @Output() upEvent = new EventEmitter<MapMouseEvent>();
    @Output() downEvent = new EventEmitter<MapMouseEvent>();
    @Output() dragEvent = new EventEmitter<MapMouseEvent>();
    @ViewChild('mapCanvas') mapCanvas: ElementRef<HTMLCanvasElement>;

    rasterSize = RASTER_DIMENSION;

    constructor(private renderingService: RenderingService) {}

    ngAfterViewInit(): void {
        // Reference the canvas and get the 2D rendering context
        const canvas = this.mapCanvas.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.renderingService.initialize(ctx);
    }

    // TODO should this be in map component? probably in a canvas helper service (rendering location as well?)
    getMouseLocation(event: MouseEvent): Vec2 {
        const rect = this.mapCanvas.nativeElement.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    onMouseEvent(emitter: EventEmitter<MapMouseEvent>, event: MouseEvent) {
        const mapEvent: MapMouseEvent = { tilePosition: this.getMouseLocation(event) };
        emitter.emit(mapEvent); // TODO this looses the ability to split into left-right events, is that okay?
    }

    ngOnDestroy(): void {
        this.renderingService.stopRendering();
    }
}
