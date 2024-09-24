import { Injectable } from '@angular/core';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
// import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
import { Item, TileTerrain } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class SpriteService {
    private tileSprites: Map<TileTerrain, HTMLImageElement>;
    private itemSprites: Map<Item, HTMLImageElement>;

    constructor() {
        this.tileSprites = new Map<TileTerrain, HTMLImageElement>();
        this.itemSprites = new Map<Item, HTMLImageElement>();
    }

    getTileSprite(tileTerrain: TileTerrain): HTMLImageElement | undefined {
        return this.tileSprites.get(tileTerrain);
    }

    getItemSprite(item: Item): HTMLImageElement | undefined {
        return this.itemSprites.get(item);
    }

    isLoaded(): boolean {
        return this.tileSprites.size === 6 && this.itemSprites.size === 9; // TODO do it another way
    }

    initialize() {
        if (!this.isLoaded()) {
            this.loadSprites();
        }
    }

    private loadSprites(): void {
        this.loadTileSprites();
        this.loadItemSprites();
    }

    private loadTileSprites() {
        Object.values(TileTerrain)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const terrain = value as TileTerrain;
                const image = new Image();
                image.src = 'assets/tiles/' + terrainToStringMap[terrain] + '.png';
                image.onload = () => {
                    this.tileSprites.set(terrain, image);
                };
            });
    }

    private loadItemSprites() {
        Object.values(Item)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const item = value as Item;
                if (item !== Item.NONE) {
                    const image = new Image();
                    image.src = 'assets/items/' + itemToStringMap[item] + '.png';
                    image.onload = () => {
                        this.itemSprites.set(item, image);
                    };
                }
            });
    }
}
