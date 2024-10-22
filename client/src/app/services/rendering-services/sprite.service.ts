import { Injectable } from '@angular/core';
import { itemToStringMap, terrainToStringMap } from '@app/constants/conversion-consts';
import { SpriteSheetChoice } from '@app/constants/player.constants';
import {
    ITEM_SPRITES_FOLDER,
    SPRITE_FILE_EXTENSION,
    TILE_SPRITES_FOLDER,
    TOTAL_ITEM_SPRITES,
    TOTAL_PLAYER_SPRITES,
    TOTAL_TILE_SPRITES,
} from '@app/constants/rendering.constants';
import { Item, TileTerrain } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class SpriteService {
    private tileSprites: Map<TileTerrain, HTMLImageElement>;
    private itemSprites: Map<Item, HTMLImageElement>;
    private playerSprite: Map<SpriteSheetChoice, HTMLImageElement>;

    // TODO use DataConversionService for the final version //

    constructor() {
        this.tileSprites = new Map<TileTerrain, HTMLImageElement>();
        this.itemSprites = new Map<Item, HTMLImageElement>();
        this.playerSprite = new Map<SpriteSheetChoice, HTMLImageElement>();
        this.loadTileSprites();
        this.loadItemSprites();
        this.loadPlayerSprites();
    }

    getTileSprite(tileTerrain: TileTerrain): HTMLImageElement | undefined {
        return this.tileSprites.get(tileTerrain);
    }

    getItemSprite(item: Item): HTMLImageElement | undefined {
        return this.itemSprites.get(item);
    }

    getPlayerSprite(playerSprite: SpriteSheetChoice): HTMLImageElement | undefined {
        return this.playerSprite.get(playerSprite);
    }

    isLoaded(): boolean {
        return (
            this.tileSprites.size === TOTAL_TILE_SPRITES &&
            this.itemSprites.size === TOTAL_ITEM_SPRITES &&
            this.playerSprite.size === TOTAL_PLAYER_SPRITES
        );
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

    private loadPlayerSprites() {
        Object.values(SpriteSheetChoice).forEach((value) => {
            const playerSprite = value as SpriteSheetChoice;
            const image = new Image();
            image.src = playerSprite;
            image.onload = () => {
                this.playerSprite.set(playerSprite, image);
            };
        });
    }
}
