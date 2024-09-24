import { Injectable } from '@angular/core';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';
import { RASTER_DIMENSION, FRAME_LENGTH } from '@app/constants/rendering.constants';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    ctx: CanvasRenderingContext2D;
    gapSize = 1; // TODO maybe do a constant or something that scales with the size?

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
        this.interval = window.setInterval(() => this.render(), FRAME_LENGTH);
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (this._spriteService.isLoaded()) {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, RASTER_DIMENSION, RASTER_DIMENSION);
            this.renderTiles();
        }
    }

    renderTiles() {
        if (this._mapRenderingStateService.map) {
            const tileDimension = this.getTileDimension();
            const tiles = this._mapRenderingStateService.map?.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this._spriteService.getTileSprite(tile.terrain);
                    if (terrainImg) {
                        this.renderEntity(terrainImg, { x: i, y: j }, tileDimension, { x: 0, y: 0 });
                    }
                    const itemImg = this._spriteService.getItemSprite(tile.item);
                    if (itemImg) {
                        this.renderEntity(itemImg, { x: i, y: j }, tileDimension, { x: 0, y: 0 });
                    }
                }
            }
        }
    }

    renderEntity(image: CanvasImageSource, tilePosition: Vec2, tileDimension: number, offset: Vec2) {
        if (image) {
            this.ctx.drawImage(
                image,
                this.getRasterPosition(tilePosition.x, tileDimension, offset.x),
                this.getRasterPosition(tilePosition.y, tileDimension, offset.y),
                tileDimension,
                tileDimension,
            );
        }
    }

    private getTileDimension(): number {
        if (this._mapRenderingStateService.map) {
            return RASTER_DIMENSION / this._mapRenderingStateService.map.size - 2 * this.gapSize;
        } else {
            return 0;
        }
    }

    private getRasterPosition(tilePosition: number, tileDimension: number, offset: number): number {
        return this.gapSize + tilePosition * (tileDimension + 2 * this.gapSize) + offset;
    }
}
