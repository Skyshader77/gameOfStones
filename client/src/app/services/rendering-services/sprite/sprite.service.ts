import { Injectable } from '@angular/core';
import { AVATAR_FIGHT_SPRITE, AVATAR_SPRITE_SHEET, FLAME_PATHS, ITEM_PATHS, TILE_PATHS } from '@app/constants/assets.constants';
import { FIGHT_BACKGROUND } from '@app/constants/fight-rendering.constants';
import {
    FLAME_WIDTH,
    SPRITE_HEIGHT,
    SPRITE_WIDTH,
    SPRITES_PER_ROW,
    TOTAL_ITEM_SPRITES,
    TOTAL_PLAYER_SPRITES,
    TOTAL_TILE_SPRITES,
} from '@app/constants/rendering.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class SpriteService {
    private tileSprites: Map<TileTerrain, HTMLImageElement>;
    private itemSprites: Map<ItemType, HTMLImageElement>;
    private playerSprite: Map<Avatar, HTMLImageElement>;
    private playerFightSprite: Map<Avatar, HTMLImageElement>;
    private flameSprites: Map<Avatar, HTMLImageElement>;
    private backgroundSprite: Map<number, HTMLImageElement>;

    constructor() {
        this.tileSprites = new Map<TileTerrain, HTMLImageElement>();
        this.itemSprites = new Map<ItemType, HTMLImageElement>();
        this.playerSprite = new Map<Avatar, HTMLImageElement>();
        this.playerFightSprite = new Map<Avatar, HTMLImageElement>();
        this.flameSprites = new Map<Avatar, HTMLImageElement>();
        this.backgroundSprite = new Map<number, HTMLImageElement>();
        this.loadTileSprites();
        this.loadItemSprites();
        this.loadPlayerSprites();
        this.loadBackgroundSprites();
    }

    getTileSprite(tileTerrain: TileTerrain): HTMLImageElement | undefined {
        return this.tileSprites.get(tileTerrain);
    }

    getItemSprite(itemType: ItemType): HTMLImageElement | undefined {
        return this.itemSprites.get(itemType);
    }

    getPlayerSpriteSheet(playerSpriteSheet: Avatar): HTMLImageElement | undefined {
        return this.playerSprite.get(playerSpriteSheet);
    }

    getPlayerFlame(playerSpriteSheet: Avatar): HTMLImageElement | undefined {
        return this.flameSprites.get(playerSpriteSheet);
    }

    getPlayerFightSpriteSheet(playerSpriteSheet: Avatar): HTMLImageElement | undefined {
        return this.playerFightSprite.get(playerSpriteSheet);
    }

    getBackgroundSpriteSheet(backgroundSpriteSheet: number): HTMLImageElement | undefined {
        return this.backgroundSprite.get(backgroundSpriteSheet);
    }

    getPlayerSpritePosition(spriteIndex: number): Vec2 {
        const column = spriteIndex % SPRITES_PER_ROW;
        const row = Math.floor(spriteIndex / SPRITES_PER_ROW);
        return { x: column * SPRITE_WIDTH, y: row * SPRITE_HEIGHT };
    }

    getFlameSpritePosition(spriteIndex: number): Vec2 {
        return { x: spriteIndex * FLAME_WIDTH, y: 0 };
    }

    isLoaded(): boolean {
        try {
            return (
                this.tileSprites.size === TOTAL_TILE_SPRITES &&
                this.itemSprites.size === TOTAL_ITEM_SPRITES &&
                this.playerSprite.size === TOTAL_PLAYER_SPRITES &&
                this.playerFightSprite.size === TOTAL_PLAYER_SPRITES
            );
        } catch (error) {
            return false;
        }
    }

    private loadTileSprites() {
        Object.values(TileTerrain)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const terrain = value as TileTerrain;
                const image = new Image();
                image.src = TILE_PATHS[terrain];
                image.onload = () => {
                    this.tileSprites.set(terrain, image);
                };
            });
    }

    private loadItemSprites() {
        Object.values(ItemType)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const item = value as ItemType;

                const image = new Image();
                image.src = ITEM_PATHS[item];
                image.onload = () => {
                    this.itemSprites.set(item, image);
                };
            });
    }

    private loadPlayerSprites() {
        Object.values(Avatar)
            .filter((v) => !isNaN(Number(v)))
            .forEach((value) => {
                const playerSprite = value as Avatar;
                const image = new Image();
                const imageFight = new Image();
                const flame = new Image();
                image.src = AVATAR_SPRITE_SHEET[playerSprite];
                imageFight.src = AVATAR_FIGHT_SPRITE[playerSprite];
                flame.src = FLAME_PATHS[playerSprite];
                image.onload = () => {
                    this.playerSprite.set(playerSprite, image);
                    this.playerFightSprite.set(playerSprite, imageFight);
                    this.flameSprites.set(playerSprite, flame);
                };
            });
    }

    private loadBackgroundSprites() {
        const image = new Image();
        image.src = FIGHT_BACKGROUND;
        image.onload = () => {
            this.backgroundSprite.set(1, image);
        };
    }
}
