import { inject, Injectable } from '@angular/core';
import {
    ACTION_STYLE,
    ARROW_STYLE,
    ARROW_WIDTH,
    HOVER_STYLE,
    IDLE_FIGHT_TRANSITION,
    MAP_PIXEL_DIMENSION,
    REACHABLE_STYLE,
    SPRITE_HEIGHT,
    SPRITE_WIDTH,
    SQUARE_SIZE,
} from '@app/constants/rendering.constants';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { directionToVec2Map, Direction } from '@common/interfaces/move';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { SpriteService } from '@app/services/rendering-services/sprite/sprite.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
@Injectable({
    providedIn: 'root',
})
export class RenderingService {
    private ctx: CanvasRenderingContext2D;
    private direction = Direction.LEFT;

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
        if (this.renderingStateService.isInFightTransition) {
            if (this.renderingStateService.transitionTimeout % IDLE_FIGHT_TRANSITION === 0) {
                this.renderFightTransition();
                this.renderingStateService.transitionTimeout = 1;
                return;
            } else {
                this.renderingStateService.transitionTimeout++;
            }
        } else {
            this.renderGame();
            this.renderUI();
        }
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

    private renderFightTransition() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.renderingStateService.xSquare, this.renderingStateService.ySquare, SQUARE_SIZE, SQUARE_SIZE);

        if (this.direction === Direction.LEFT) {
            this.renderingStateService.xSquare -= SQUARE_SIZE;
            if (this.renderingStateService.xSquare <= this.renderingStateService.left) {
                this.direction = Direction.DOWN;
                this.renderingStateService.xSquare = this.renderingStateService.left;
                this.renderingStateService.top += SQUARE_SIZE;
            }
        } else if (this.direction === Direction.DOWN) {
            this.renderingStateService.ySquare += SQUARE_SIZE;
            if (this.renderingStateService.ySquare >= this.renderingStateService.bottom - SQUARE_SIZE) {
                this.direction = Direction.RIGHT;
                this.renderingStateService.ySquare = this.renderingStateService.bottom - SQUARE_SIZE;
                this.renderingStateService.left += SQUARE_SIZE;
            }
        } else if (this.direction === Direction.RIGHT) {
            this.renderingStateService.xSquare += SQUARE_SIZE;
            if (this.renderingStateService.xSquare >= this.renderingStateService.right - SQUARE_SIZE) {
                this.direction = Direction.UP;
                this.renderingStateService.xSquare = this.renderingStateService.right - SQUARE_SIZE;
                this.renderingStateService.bottom -= SQUARE_SIZE;
            }
        } else if (this.direction === Direction.UP) {
            this.renderingStateService.ySquare -= SQUARE_SIZE;
            if (this.renderingStateService.ySquare <= this.renderingStateService.top) {
                this.direction = Direction.LEFT;
                this.renderingStateService.ySquare = this.renderingStateService.top;
                this.renderingStateService.right -= SQUARE_SIZE;
            }
        }

        if (
            this.renderingStateService.left > this.renderingStateService.right ||
            this.renderingStateService.top > this.renderingStateService.bottom
        ) {
            this.renderingStateService.isInFightTransition = false;
            this.renderingStateService.fightStarted = true;
            this.resetCornerPositions();
            return;
        }
    }

    private resetCornerPositions() {
        this.renderingStateService.xSquare = MAP_PIXEL_DIMENSION - SQUARE_SIZE;
        this.renderingStateService.ySquare = 0;
        this.renderingStateService.top = 0;
        this.renderingStateService.bottom = MAP_PIXEL_DIMENSION;
        this.renderingStateService.left = 0;
        this.renderingStateService.right = MAP_PIXEL_DIMENSION;
        this.renderingStateService.transitionTimeout = 0;
        this.direction = Direction.LEFT;
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
                const spriteIndex =
                    player.renderInfo.currentSprite +
                    (this.movementService.isMoving() && this.playerListService.currentPlayerName === player.playerInfo.userName
                        ? player.renderInfo.currentStep
                        : 0);
                this.renderSpriteEntity(
                    playerSprite,
                    this.getRasterPosition(player.playerInGame.currentPosition, player.renderInfo.offset),
                    spriteIndex,
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
