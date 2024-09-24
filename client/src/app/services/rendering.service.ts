import { Injectable } from '@angular/core';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';

// TODO use DataConversionService for the final version //

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    ctx: CanvasRenderingContext2D;

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
        this.interval = window.setInterval(() => this.render(), 1000 / 1);
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (this._spriteService.isLoaded()) {
            this.renderTiles();
        }
    }

    renderTiles() {
        if (this._mapRenderingStateService.map) {
            const tileDimension = 1200 / this._mapRenderingStateService.map.size;
            const tiles = this._mapRenderingStateService.map?.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this._spriteService.getTileSprite(tile.terrain);
                    if (terrainImg) {
                        this.ctx.drawImage(terrainImg, i, j, tileDimension, tileDimension); // TODO match to tile sizes and stuff
                    }
                    const itemImg = this._spriteService.getItemSprite(tile.item);
                    if (itemImg) {
                        this.ctx.drawImage(itemImg, i, j, tileDimension, tileDimension);
                    }
                }
            }
        }
    }
}
