import { Injectable } from '@angular/core';
import { MapRenderingStateService } from './map-rendering-state.service';
import { Item, TileTerrain } from '@app/interfaces/map';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';

// TODO use DataConversionService for the final version //

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    ctx: CanvasRenderingContext2D;

    private tileImages: Map<TileTerrain, HTMLImageElement>;
    private itemImages: Map<Item, HTMLImageElement>;
    private loaded: boolean = false;

    private interval: number | undefined = undefined;

    constructor(private _mapRenderingStateService: MapRenderingStateService) {}

    initialize(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        if (!this.loaded) {
            this.loadSprites();
        }
    }

    loadSprites(): void {
        this.loadTileSprites();
        this.loadItemSprites();
    }

    loadTileSprites() {
        this.tileImages = new Map<TileTerrain, HTMLImageElement>();
        Object.values(TileTerrain).forEach((value) => {
            const terrain = value as TileTerrain;
            const image = new HTMLImageElement();
            image.src = '/assets/tiles/' + terrainToStringMap[terrain]; // TODO
            image.onload = () => {
                this.tileImages.set(terrain, image);
                if (this.isFullyLoaded()) {
                    this.loaded = true;
                }
            };
        });
    }

    loadItemSprites() {
        this.itemImages = new Map<Item, HTMLImageElement>();
        Object.values(Item).forEach((value) => {
            const item = value as Item;
            if (item !== Item.NONE) {
                const image = new HTMLImageElement();
                image.src = '/assets/items' + itemToStringMap[item]; // TODO
                image.onload = () => {
                    this.itemImages.set(item, image);
                    if (this.isFullyLoaded()) {
                        this.loaded = true;
                    }
                };
            }
        });
    }

    renderingLoop() {
        this.interval = window.setInterval(() => this.render(), 1000 / 1);
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (this.loaded) {
            this.renderTiles();
        }
    }

    renderTiles() {
        if (this._mapRenderingStateService.map) {
            const tiles = this._mapRenderingStateService.map?.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this.getTerrainImage(tile.terrain);
                    if (terrainImg) {
                        this.ctx.drawImage(terrainImg, i, j); // TODO match to tile sizes and stuff
                    }
                    const itemImg = this.getItemImage(tile.item);
                    if (itemImg) {
                        this.ctx.drawImage(itemImg, i, j);
                    }
                }
            }
        }
    }

    getTerrainImage(terrain: TileTerrain): HTMLImageElement | undefined {
        return this.tileImages.get(terrain);
    }

    getItemImage(item: Item): HTMLImageElement | undefined {
        return this.itemImages.get(item);
    }

    private isFullyLoaded(): boolean {
        return this.tileImages.size === 6 && this.itemImages.size === 9; // TODO do it another way
    }
}
