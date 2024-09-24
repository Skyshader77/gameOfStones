import { Injectable } from '@angular/core';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
import {
    ITEM_SPRITES_FOLDER,
    SPRITE_FILE_EXTENSION,
    TILE_SPRITES_FOLDER,
    TOTAL_ITEM_SPRITES,
    TOTAL_TILE_SPRITES,
} from '@app/constants/rendering.constants';
import { Item, TileTerrain } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class SpriteService {
    private tileSprites: Map<TileTerrain, HTMLImageElement>;
    private itemSprites: Map<Item, HTMLImageElement>;

    // TODO use DataConversionService for the final version //

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
        return this.tileSprites.size === TOTAL_TILE_SPRITES && this.itemSprites.size === TOTAL_ITEM_SPRITES;
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

    // TODO very similar functions, maybe merge them?

    private loadTileSprites() {
        Object.values(TileTerrain)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const terrain = value as TileTerrain;
                const image = new Image();
                image.src = TILE_SPRITES_FOLDER + terrainToStringMap[terrain] + SPRITE_FILE_EXTENSION;
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
                    image.src = ITEM_SPRITES_FOLDER + itemToStringMap[item] + SPRITE_FILE_EXTENSION;
                    image.onload = () => {
                        this.itemSprites.set(item, image);
                    };
                }
            });
    }
}
