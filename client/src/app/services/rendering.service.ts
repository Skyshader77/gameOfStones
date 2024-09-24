import { Injectable } from '@angular/core';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';

// TODO use DataConversionService for the final version //
// TODO add a constant for the map dimension

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    ctx: CanvasRenderingContext2D;
    gapSize = 5; // TODO maybe do a constant or something that scales with the size?

    private interval: number | undefined = undefined;

    constructor(
        private _mapRenderingStateService: MapRenderingStateService,
        private _spriteService: SpriteService,
    ) {}

    initialize(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this._spriteService.initialize();
        this.renderingLoop();
    }

    renderingLoop() {
        this.interval = window.setInterval(() => this.render(), 1000 / 1); // TODO maybe use the time service for this?
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (this._spriteService.isLoaded()) {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, 1200, 1200);
            this.renderTiles();
        }
    }

    renderTiles() {
        if (this._mapRenderingStateService.map) {
            const tileDimension = 1200 / this._mapRenderingStateService.map.size - 2 * this.gapSize;
            const tiles = this._mapRenderingStateService.map?.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this._spriteService.getTileSprite(tile.terrain);
                    if (terrainImg) {
                        this.ctx.drawImage(
                            terrainImg,
                            this.gapSize + i * (tileDimension + 2 * this.gapSize),
                            this.gapSize + j * (tileDimension + 2 * this.gapSize),
                            tileDimension,
                            tileDimension,
                        );
                    }
                    const itemImg = this._spriteService.getItemSprite(tile.item);
                    if (itemImg) {
                        this.ctx.drawImage(
                            itemImg,
                            this.gapSize + i * (tileDimension + 2 * this.gapSize),
                            this.gapSize + j * (tileDimension + 2 * this.gapSize),
                            tileDimension,
                            tileDimension,
                        );
                    }
                }
            }
        }
    }
}
