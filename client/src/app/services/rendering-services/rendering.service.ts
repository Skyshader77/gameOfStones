import { Injectable } from '@angular/core';
import { directionToVec2Map as DIRECTION_TO_SPEED } from '@app/constants/conversion.constants';
import { FRAME_LENGTH, IDLE_FRAMES, MOVEMENT_FRAMES, SPRITE_HEIGHT, SPRITE_WIDTH } from '@app/constants/rendering.constants';
import { PlayerInGame } from '@app/interfaces/player';
import { Direction } from '@app/interfaces/reachableTiles';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';
import { Map } from '@app/interfaces/map';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    ctx: CanvasRenderingContext2D;
    frames = 1;
    timeout = 1;
    isMoving = false;

    private interval: number | undefined = undefined;

    constructor(
        private _mapRenderingStateService: MapRenderingStateService,
        private _spriteService: SpriteService,
    ) {}

    initialize(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.renderingLoop();
    }

    renderHoverEffect(): void {
        if (this._mapRenderingStateService.hoveredTile) {
            const tileDimension = this.getTileDimension();
            const hoverPos = this.getRasterPosition(this._mapRenderingStateService.hoveredTile);

            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fillRect(hoverPos.x, hoverPos.y, tileDimension, tileDimension);
        }
    }

    renderPlayableTiles(): void {
        if (this._mapRenderingStateService.playableTiles.length > 0) {
            const tileDimension = this.getTileDimension();
            for (const tile of this._mapRenderingStateService.playableTiles) {
                const playablePos = this.getRasterPosition(tile.pos);

                this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                this.ctx.fillRect(playablePos.x, playablePos.y, tileDimension, tileDimension);
            }
        }
    }

    renderingLoop() {
        this.interval = window.setInterval(() => {
            this.render();
            this.renderPlayableTiles();
            this.renderHoverEffect();
            if (this._mapRenderingStateService.playerMovementsQueue.length > 0) {
                this._mapRenderingStateService.isMoving = true;
                this.renderMovement(
                    this._mapRenderingStateService.playerMovementsQueue[0].direction,
                    this._mapRenderingStateService.playerMovementsQueue[0].player,
                );
            } else {
                this._mapRenderingStateService.isMoving = false;
            }
        }, FRAME_LENGTH);
    }

    renderMovement(direction: Direction, player: PlayerInGame) {
        let speed: Vec2 = { x: 0, y: 0 };
        const playerIndex = this._mapRenderingStateService.players.indexOf(player);

        if (playerIndex === -1) {
            return;
        }

        player.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[direction];
        speed = DIRECTION_TO_SPEED[direction];

        if (this.frames % MOVEMENT_FRAMES === 0) {
            if (this.timeout % IDLE_FRAMES === 0) {
                this.timeout = 1;
                this.frames = 1;
                this._mapRenderingStateService.updatePosition(playerIndex, speed);
                this._mapRenderingStateService.playerMovementsQueue.shift();
            } else {
                this.timeout++;
            }
        } else {
            this._mapRenderingStateService.movePlayer(playerIndex, speed, this.getTileDimension());
            this.frames++;
        }
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    renderScreenshot(ctx: CanvasRenderingContext2D): string {
        this.ctx = ctx;
        this.render();
        return this.ctx.canvas.toDataURL(SCREENSHOT_FORMAT, SCREENSHOT_QUALITY);
    }

    render() {
        if (this._spriteService.isLoaded()) {
            const gameMap = this._mapRenderingStateService.map;
            if (gameMap) {
                this.renderTiles(gameMap);
                this.renderItems(gameMap);
                this.renderPlayers();
            }
        }
    }

    renderTiles(gameMap: Map) {
        if (this._mapRenderingStateService.map) {
            const tiles = gameMap.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this._spriteService.getTileSprite(tile);
                    if (terrainImg) {
                        this.renderEntity(terrainImg, this.getRasterPosition({ x: j, y: i }));
                    }
                }
            }
        }
    }

    renderItems(gameMap: Map) {
        for (const item of gameMap.placedItems) {
            const itemSprite = this._spriteService.getItemSprite(item.type);
            if (itemSprite) {
                this.renderEntity(itemSprite, this.getRasterPosition(item.position));
            }
        }
    }

    renderPlayers() {
        for (const player of this._mapRenderingStateService.players) {
            const playerSprite = this._spriteService.getPlayerSpriteSheet(player.renderInfo.spriteSheet);
            if (playerSprite) {
                this.renderSpriteEntity(
                    playerSprite,
                    this.getRasterPosition(player.currentPosition, player.renderInfo.offset),
                    player.renderInfo.currentSprite,
                );
            }
        }
    }

    renderEntity(image: CanvasImageSource, canvasPosition: Vec2) {
        if (image) {
            const tileDimension = this.getTileDimension();
            this.ctx.drawImage(image, canvasPosition.x, canvasPosition.y, tileDimension, tileDimension);
        }
    }

    renderSpriteEntity(image: CanvasImageSource, canvasPosition: Vec2, spriteIndex: number) {
        if (image) {
            const tileDimension = this.getTileDimension();

            if (spriteIndex !== null) {
                const spritePosition = this._spriteService.getSpritePosition(spriteIndex);
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

    private getTileDimension(): number {
        if (this._mapRenderingStateService.map) {
            return this.ctx.canvas.width / this._mapRenderingStateService.map.size;
        } else {
            return 0;
        }
    }

    private getRasterPosition(tilePosition: Vec2, offset: Vec2 = { x: 0, y: 0 }): Vec2 {
        const tileDimension = this.getTileDimension();
        return { x: tilePosition.x * tileDimension + offset.x, y: tilePosition.y * tileDimension + offset.y };
    }
}
