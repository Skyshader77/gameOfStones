import { inject, Injectable } from '@angular/core';
import {
    ACTION_STYLE,
    ARROW_STYLE,
    ARROW_WIDTH,
    HOVER_STYLE,
    REACHABLE_STYLE,
    SPRITE_HEIGHT,
    SPRITE_WIDTH,
} from '@app/constants/rendering.constants';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { SpriteService } from './sprite.service';
import { Map } from '@common/interfaces/map';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { SpriteSheetChoice } from '@app/constants/player.constants';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { directionToVec2Map } from '@common/interfaces/move';
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

    renderPath(): void {
        if (this.mapRenderingStateService.arrowHead && this.myPlayer.isCurrentPlayer) {
            const tileDimension = this.gameMapService.getTileDimension();
            const reachableTile = this.mapRenderingStateService.arrowHead;
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (!currentPlayer) return;
            let currentPosition = currentPlayer.playerInGame.currentPosition;

            this.ctx.strokeStyle = ARROW_STYLE;
            this.ctx.lineWidth = ARROW_WIDTH;

            for (const direction of reachableTile.path) {
                const moveVec = directionToVec2Map[direction];

                const nextPosition = {
                    x: currentPosition.x + moveVec.x,
                    y: currentPosition.y + moveVec.y,
                };

                const startPos = this.getRasterPosition(currentPosition);
                const endPos = this.getRasterPosition(nextPosition);

                this.ctx.beginPath();
                this.ctx.moveTo(startPos.x + tileDimension / 2, startPos.y + tileDimension / 2);
                this.ctx.lineTo(endPos.x + tileDimension / 2, endPos.y + tileDimension / 2);
                this.ctx.stroke();

                currentPosition = nextPosition;
            }
        } else {
            this.mapRenderingStateService.arrowHead = null;
        }
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

    renderActionTiles(): void {
        const tileDimension = this.gameMapService.getTileDimension();
        for (const tile of this.mapRenderingStateService.actionTiles) {
            const actionTile = this.getRasterPosition(tile);

            this.ctx.fillStyle = ACTION_STYLE;
            this.ctx.fillRect(actionTile.x, actionTile.y, tileDimension, tileDimension);
        }
    }

    renderAll() {
        this.render();
        this.renderPlayableTiles();
        this.renderHoverEffect();
        this.renderActionTiles();
        this.renderPath();
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

    renderItems(gameMap: Map) {
        for (const item of gameMap.placedItems) {
            const itemSprite = this.spriteService.getItemSprite(item.type);
            if (itemSprite) {
                this.renderEntity(itemSprite, this.getRasterPosition(item.position));
            }
        }
    }

    renderPlayers() {
        for (const player of this.playerListService.playerList) {
            const playerSprite = this.spriteService.getPlayerSpriteSheet(SpriteSheetChoice.FemaleHealer);
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
