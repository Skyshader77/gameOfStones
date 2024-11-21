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
import { RenderingStateService } from '../rendering-state/rendering-state.service';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { SpriteService } from './sprite.service';
import { PlayerListService } from '@app/services/room-services/player-list/player-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { directionToVec2Map } from '@common/interfaces/move';
@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    private ctx: CanvasRenderingContext2D;

    private renderingStateService = inject(RenderingStateService);
    private playerListService: PlayerListService = inject(PlayerListService);
    private gameMapService: GameMapService = inject(GameMapService);
    private spriteService: SpriteService = inject(SpriteService);
    private movementService: MovementService = inject(MovementService);
    private myPlayer: MyPlayerService = inject(MyPlayerService);

    setContext(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    renderAll() {
        this.renderGame();
        this.renderUI();
    }

    renderScreenshot(ctx: CanvasRenderingContext2D): string {
        this.setContext(ctx);
        this.renderGame();
        return this.ctx.canvas.toDataURL(SCREENSHOT_FORMAT, SCREENSHOT_QUALITY);
    }

    private renderGame() {
        if (this.spriteService.isLoaded()) {
            this.renderTiles();
            this.renderItems();
            this.renderPlayers();
        }
    }

    private renderTiles() {
        const tiles = this.gameMapService.map.mapArray;
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

    private renderItems() {
        for (const item of this.gameMapService.map.placedItems) {
            const itemSprite = this.spriteService.getItemSprite(item.type);
            if (itemSprite) {
                this.renderEntity(itemSprite, this.getRasterPosition(item.position));
            }
        }
    }

    private renderPlayers() {
        for (const player of this.playerListService.playerList) {
            if (player.playerInGame.hasAbandoned) continue;
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

    private renderEntity(image: CanvasImageSource, canvasPosition: Vec2) {
        const tileDimension = this.gameMapService.getTileDimension();
        this.ctx.drawImage(image, canvasPosition.x, canvasPosition.y, tileDimension, tileDimension);
    }

    private renderSpriteEntity(image: CanvasImageSource, canvasPosition: Vec2, spriteIndex: number) {
        const tileDimension = this.gameMapService.getTileDimension();

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

    private renderUI(): void {
        if (this.renderingStateService.displayPlayableTiles) {
            this.renderPlayableTiles();
        }
        this.renderHoverEffect();
        if (this.renderingStateService.displayActions) {
            this.renderActionTiles();
        }
        this.renderPath();
    }

    private renderPath(): void {
        if (this.renderingStateService.arrowHead && this.myPlayer.isCurrentPlayer) {
            const tileDimension = this.gameMapService.getTileDimension();
            const reachableTile = this.renderingStateService.arrowHead;
            const currentPlayer = this.playerListService.getCurrentPlayer();
            if (!currentPlayer) return;
            let currentPosition = currentPlayer.playerInGame.currentPosition;

            this.ctx.strokeStyle = ARROW_STYLE;
            this.ctx.lineWidth = ARROW_WIDTH;

            for (const node of reachableTile.path) {
                const moveVec = directionToVec2Map[node.direction];

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
        }
    }

    private renderHoverEffect(): void {
        if (this.renderingStateService.hoveredTile) {
            const tileDimension = this.gameMapService.getTileDimension();
            const hoverPos = this.getRasterPosition(this.renderingStateService.hoveredTile);

            this.ctx.fillStyle = HOVER_STYLE;
            this.ctx.fillRect(hoverPos.x, hoverPos.y, tileDimension, tileDimension);
        }
    }

    private renderPlayableTiles(): void {
        if (!this.movementService.isMoving() && this.myPlayer.isCurrentPlayer) {
            const tileDimension = this.gameMapService.getTileDimension();
            for (const tile of this.renderingStateService.playableTiles) {
                const playablePos = this.getRasterPosition(tile.position);

                this.ctx.fillStyle = REACHABLE_STYLE;
                this.ctx.fillRect(playablePos.x, playablePos.y, tileDimension, tileDimension);
            }
        }
    }

    private renderActionTiles(): void {
        const tileDimension = this.gameMapService.getTileDimension();
        for (const tile of this.renderingStateService.actionTiles) {
            const actionTile = this.getRasterPosition(tile.position);

            this.ctx.fillStyle = ACTION_STYLE;
            this.ctx.fillRect(actionTile.x, actionTile.y, tileDimension, tileDimension);
        }
    }

    private getRasterPosition(tilePosition: Vec2, offset: Vec2 = { x: 0, y: 0 }): Vec2 {
        const tileDimension = this.gameMapService.getTileDimension();
        return { x: tilePosition.x * tileDimension + offset.x, y: tilePosition.y * tileDimension + offset.y };
    }
}
