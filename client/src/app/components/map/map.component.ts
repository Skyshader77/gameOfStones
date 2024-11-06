import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent, MapMouseEventButton } from '@app/interfaces/map-mouse-event';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { RenderingService } from '@app/services/rendering-services/rendering.service';

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
    @Output() moveEvent = new EventEmitter<MapMouseEvent>();
    @Output() rightClickEvent = new EventEmitter<MapMouseEvent>();
    @ViewChild('mapCanvas') mapCanvas: ElementRef<HTMLCanvasElement>;

    rasterSize = MAP_PIXEL_DIMENSION;

    constructor(
        private renderingService: RenderingService,
        private gameLoopService: GameLoopService,
        private mapInputService: GameMapInputService,
    ) {}

    ngAfterViewInit(): void {
        const canvas = this.mapCanvas.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.renderingService.setContext(ctx);
        this.gameLoopService.startGameLoop();
    }

    onMouseEvent(emitter: EventEmitter<MapMouseEvent>, event: MouseEvent) {
        if (event.type === 'contextmenu') {
            event.preventDefault();
            event.stopPropagation();
        }
        const mapEvent: MapMouseEvent = {
            tilePosition: this.mapInputService.getMouseLocation(this.mapCanvas.nativeElement, event),
            button: event.button as MapMouseEventButton,
        };
        emitter.emit(mapEvent);
    }

    ngOnDestroy(): void {
        this.gameLoopService.stopGameLoop();
    }
}
