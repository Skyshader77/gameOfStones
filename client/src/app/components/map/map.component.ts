import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { RASTER_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { RenderingService } from '@app/services/rendering-services/rendering.service';
import { Vec2 } from '@common/interfaces/vec2';

@Component({
    selector: 'app-edit-map',
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
    @Output() moveEvent = new EventEmitter<MapMouseEvent>();
    @ViewChild('mapCanvas') mapCanvas: ElementRef<HTMLCanvasElement>;

    rasterSize = RASTER_DIMENSION;

    constructor(
        private renderingService: RenderingService,
        private mapState: MapRenderingStateService,
    ) {}

    ngAfterViewInit(): void {
        // Reference the canvas and get the 2D rendering context
        const canvas = this.mapCanvas.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.renderingService.initialize(ctx);
    }

    convertToTilePosition(position: Vec2) {
        if (this.mapState.map) {
            const tileSize: number = RASTER_DIMENSION / this.mapState.map.size;

            return {
                x: Math.floor(position.x / tileSize),
                y: Math.floor(position.y / tileSize),
            };
        } else {
            return { x: 0, y: 0 };
        }
    }

    // TODO should this be in map component? probably in a canvas helper service (rendering location as well?)
    getMouseLocation(event: MouseEvent): Vec2 {
        const rect = this.mapCanvas.nativeElement.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const normalizedX = (x / rect.width) * RASTER_DIMENSION;
        const normalizedY = (y / rect.height) * RASTER_DIMENSION;

        const finalX = Math.max(0, Math.min(Math.round(normalizedX), RASTER_DIMENSION));
        const finalY = Math.max(0, Math.min(Math.round(normalizedY), RASTER_DIMENSION));

        return this.convertToTilePosition({ x: finalX, y: finalY });
    }

    onMouseEvent(emitter: EventEmitter<MapMouseEvent>, event: MouseEvent) {
        const mapEvent: MapMouseEvent = { tilePosition: this.getMouseLocation(event) };
        emitter.emit(mapEvent);
    }

    ngOnDestroy(): void {
        this.renderingService.stopRendering();
    }
}
