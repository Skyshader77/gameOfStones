import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MapMouseEvent } from '@app/interfaces/map';
import { Vec2 } from '@app/interfaces/vec2';
import { RenderingService } from '@app/services/rendering.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [],
    templateUrl: './map.component.html',
})
export class MapComponent implements AfterViewInit {
    @Output() clickEvent = new EventEmitter<MapMouseEvent>();
    @Output() overEvent = new EventEmitter<MapMouseEvent>();
    @Output() upEvent = new EventEmitter<MapMouseEvent>();
    @Output() downEvent = new EventEmitter<MapMouseEvent>();
    @Output() dragEvent = new EventEmitter<MapMouseEvent>();
    @ViewChild('mapCanvas') mapCanvas: ElementRef<HTMLCanvasElement>;

    canvasSize = 1200; // TODO use an actual constant
    private ctx: CanvasRenderingContext2D;

    constructor(private renderingService: RenderingService) {}

    ngAfterViewInit(): void {
        // Reference the canvas and get the 2D rendering context
        const canvas = this.mapCanvas.nativeElement;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.renderingService.initialize(this.ctx);
    }

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
}
