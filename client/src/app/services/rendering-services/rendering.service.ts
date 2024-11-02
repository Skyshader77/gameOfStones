import { inject, Injectable } from '@angular/core';
import { HOVER_STYLE, REACHABLE_STYLE, SPRITE_HEIGHT, SPRITE_WIDTH } from '@app/constants/rendering.constants';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { SpriteService } from './sprite.service';
import { Map } from '@common/interfaces/map';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    frames = 1;
    timeout = 1;
    isMoving = false;

    private ctx: CanvasRenderingContext2D;

    private mapRenderingStateService = inject(MapRenderingStateService);

    constructor(
        private playerListService: PlayerListService,
        private gameMapService: GameMapService,
        private spriteService: SpriteService,
        private movementService: MovementService,
        private myPlayer: MyPlayerService,
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
        if (this.mapRenderingStateService.playableTiles.length > 0 && !this.movementService.isMoving() && this.myPlayer.isCurrentPlayer) {
            const tileDimension = this.gameMapService.getTileDimension();
            for (const tile of this.mapRenderingStateService.playableTiles) {
                const playablePos = this.getRasterPosition(tile.position);

                this.ctx.fillStyle = REACHABLE_STYLE;
                this.ctx.fillRect(playablePos.x, playablePos.y, tileDimension, tileDimension);
            }
        }
    }

    renderAll() {
        this.render();
        this.renderPlayableTiles();
        this.renderHoverEffect();
    }

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
        for (const player of this.playerListService.playerList) {
            // TODO
            const playerSprite = this.spriteService.getPlayerSpriteSheet(player.playerInfo.avatar);
            if (playerSprite) {
                this.renderSpriteEntity(
                    playerSprite,
                    this.getRasterPosition(player.playerInGame.currentPosition, player.renderInfo.offset),
                    player.renderInfo.currentSprite,
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
