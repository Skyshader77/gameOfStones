import { Injectable } from '@angular/core';
import { HOVER_STYLE, REACHABLE_STYLE, SPRITE_HEIGHT, SPRITE_WIDTH } from '@app/constants/rendering.constants';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';
import { Map } from '@app/interfaces/map';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from '@app/services/room-services/game-map.service';

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    frames = 1;
    timeout = 1;
    isMoving = false;

    private ctx: CanvasRenderingContext2D;

    constructor(
        private mapRenderingStateService: MapRenderingStateService,
        private gameMapService: GameMapService,
        private spriteService: SpriteService,
    ) {}

    setContext(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    renderHoverEffect(): void {
        if (this.mapRenderingStateService.hoveredTile) {
            const tileDimension = this.gameMapService.getTileDimension();
            const hoverPos = this.getRasterPosition(this.mapRenderingStateService.hoveredTile);

            this.ctx.fillStyle = HOVER_STYLE;
            this.ctx.fillRect(hoverPos.x, hoverPos.y, tileDimension, tileDimension);
        }
    }

    renderPlayableTiles(): void {
        if (this.mapRenderingStateService.playableTiles.length > 0) {
            const tileDimension = this.gameMapService.getTileDimension();
            for (const tile of this.mapRenderingStateService.playableTiles) {
                const playablePos = this.getRasterPosition(tile.pos);

                this.ctx.fillStyle = REACHABLE_STYLE;
                this.ctx.fillRect(playablePos.x, playablePos.y, tileDimension, tileDimension);
            }
        }
    }

    // renderingLoop() {
    //     this.interval = window.setInterval(() => {
    //         this.render();
    //         this.renderPlayableTiles();
    //         this.renderHoverEffect();
    //     }, FRAME_LENGTH);
    // }

    renderAll() {
        this.render();
        this.renderPlayableTiles();
        this.renderHoverEffect();
    }

    // stopRendering() {
    //     clearInterval(this.interval);
    //     this.interval = undefined;
    // }

    renderScreenshot(ctx: CanvasRenderingContext2D): string {
        this.setContext(ctx);
        this.render();
        return this.ctx.canvas.toDataURL(SCREENSHOT_FORMAT, SCREENSHOT_QUALITY);
    }

    render() {
        if (this.spriteService.isLoaded()) {
            if (this.gameMapService.map) {
                this.renderTiles(this.gameMapService.map);
                this.renderItems(this.gameMapService.map);
                this.renderPlayers();
            }
        }
    }

    renderTiles(gameMap: Map) {
        if (gameMap) {
            const tiles = gameMap.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this.spriteService.getTileSprite(tile);
                    if (terrainImg) {
                        this.renderEntity(terrainImg, this.getRasterPosition({ x: j, y: i }));
                    }
                }
            }
        }
    }

    renderItems(gameMap: Map) {
        for (const item of gameMap.placedItems) {
            const itemSprite = this.spriteService.getItemSprite(item.type);
            if (itemSprite) {
                this.renderEntity(itemSprite, this.getRasterPosition(item.position));
            }
        }
    }

    // TODO use the player list service
    renderPlayers() {
        for (const player of this.mapRenderingStateService.players) {
            const playerSprite = this.spriteService.getPlayerSpriteSheet(player.playerInGame.renderInfo.spriteSheet);
            if (playerSprite) {
                this.renderSpriteEntity(
                    playerSprite,
                    this.getRasterPosition(player.playerInGame.currentPosition, player.playerInGame.renderInfo.offset),
                    player.playerInGame.renderInfo.currentSprite,
                );
            }
        }
    }

    renderEntity(image: CanvasImageSource, canvasPosition: Vec2) {
        if (image) {
            const tileDimension = this.gameMapService.getTileDimension();
            this.ctx.drawImage(image, canvasPosition.x, canvasPosition.y, tileDimension, tileDimension);
        }
    }

    renderSpriteEntity(image: CanvasImageSource, canvasPosition: Vec2, spriteIndex: number) {
        if (image) {
            const tileDimension = this.gameMapService.getTileDimension();

            if (spriteIndex !== null) {
                const spritePosition = this.spriteService.getSpritePosition(spriteIndex);
                this.ctx.drawImage(
                    image,
                    spritePosition.x,
                    spritePosition.y,
                    SPRITE_WIDTH,
                    SPRITE_HEIGHT,
                    canvasPosition.x,
                    canvasPosition.y,
                    tileDimension,
                    tileDimension,
                );
            }
        }
    }

    private getRasterPosition(tilePosition: Vec2, offset: Vec2 = { x: 0, y: 0 }): Vec2 {
        const tileDimension = this.gameMapService.getTileDimension();
        return { x: tilePosition.x * tileDimension + offset.x, y: tilePosition.y * tileDimension + offset.y };
    }
}
