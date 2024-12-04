import { inject, Injectable } from '@angular/core';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '@app/constants/edit-page.constants';
import { BLACK } from '@app/constants/fight-rendering.constants';
import {
    ACTION_STYLE,
    AFFECTED_TILE_STYLE,
    ARROW_STYLE,
    ARROW_WIDTH,
    DEG_TO_RADIAN_FACTOR,
    FLAME_COUNT,
    FLAME_FRAME_RATE,
    FLAME_HEIGHT,
    FLAME_WIDTH,
    HOVER_STYLE,
    IDLE_FIGHT_TRANSITION,
    ITEM_STYLE,
    REACHABLE_STYLE,
    SPRITE_HEIGHT,
    SPRITE_WIDTH,
    SQUARE_SIZE,
} from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { SpritePositionInfo } from '@app/interfaces/sprite';
import { MovementService } from '@app/services/movement-service/movement.service';
import { SpriteService } from '@app/services/rendering-services/sprite/sprite.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { ItemType } from '@common/enums/item-type.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { directionToVec2Map } from '@common/interfaces/move';
import { OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
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
            this.renderFlames();
            this.renderItems();
            this.renderPlayers();
        }
    }

    private renderFightTransition() {
        this.ctx.fillStyle = BLACK;
        this.ctx.fillRect(this.renderingStateService.squarePos.x, this.renderingStateService.squarePos.y, SQUARE_SIZE, SQUARE_SIZE);

        this.renderingStateService.updateFightTransition();
    }

    private renderItemTiles() {
        for (const item of this.renderingStateService.itemTiles) {
            if (this.shouldRenderItemTile(item.overWorldAction)) {
                const itemPos = this.getRasterPosition(item.overWorldAction.position);
                this.ctx.fillStyle = ITEM_STYLE;
                this.ctx.fillRect(itemPos.x, itemPos.y, this.gameMapService.getTileDimension(), this.gameMapService.getTileDimension());
            }
        }
    }

    private renderItemAffectedTiles() {
        for (const item of this.renderingStateService.itemTiles) {
            if (this.shouldRenderItemAffectedTile(item.overWorldAction)) {
                for (const tile of item.affectedTiles) {
                    const tilePos = this.getRasterPosition(tile);
                    if (this.playerListService.isPlayerOnTile(tile)) {
                        this.ctx.fillStyle = ACTION_STYLE;
                    } else {
                        this.ctx.fillStyle = AFFECTED_TILE_STYLE;
                    }

                    this.ctx.fillRect(tilePos.x, tilePos.y, this.gameMapService.getTileDimension(), this.gameMapService.getTileDimension());
                }
            }
        }
    }

    private shouldRenderItemTile(itemAction: OverWorldAction) {
        return (
            (this.renderingStateService.currentlySelectedItem === ItemType.GraniteHammer && itemAction.action === OverWorldActionType.Hammer) ||
            (this.renderingStateService.currentlySelectedItem === ItemType.GeodeBomb && itemAction.action === OverWorldActionType.Bomb)
        );
    }

    private shouldRenderItemAffectedTile(itemAction: OverWorldAction) {
        return (
            this.shouldRenderItemTile(itemAction) &&
            itemAction.position.x === this.renderingStateService.hoveredTile?.x &&
            itemAction.position.y === this.renderingStateService.hoveredTile?.y
        );
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

    private renderFlames() {
        for (const player of this.playerListService.playerList) {
            if (player.playerInGame.hasAbandoned) continue;
            this.renderFlame(player);
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

                const spritePosition = this.spriteService.getPlayerSpritePosition(spriteIndex);
                this.renderPlayer(player, playerSprite, spritePosition);
            }
        }
    }

    private renderPlayer(player: Player, playerSprite: HTMLImageElement, spritePosition: Vec2) {
        const tileDimension = this.gameMapService.getTileDimension();
        const center = this.getRasterPosition(player.playerInGame.currentPosition, {
            x: player.renderInfo.offset.x + tileDimension / 2,
            y: player.renderInfo.offset.y + tileDimension / 2,
        });
        const angleInRadians = player.renderInfo.angle * DEG_TO_RADIAN_FACTOR;
        this.ctx.setTransform(
            Math.cos(angleInRadians),
            Math.sin(angleInRadians),
            -Math.sin(angleInRadians),
            Math.cos(angleInRadians),
            center.x,
            center.y,
        );

        this.renderSpriteEntity(
            playerSprite,
            { x: -tileDimension / 2, y: -tileDimension / 2 },
            {
                spritePosition,
                spriteDimensions: {
                    x: SPRITE_WIDTH,
                    y: SPRITE_HEIGHT,
                },
            },
        );

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    private renderFlame(player: Player) {
        const flameSprite = this.spriteService.getPlayerFlame(player.playerInfo.avatar);
        if (flameSprite) {
            const spriteIndex = Math.floor(this.renderingStateService.counter / FLAME_FRAME_RATE) % FLAME_COUNT;
            const flamePosition = this.spriteService.getFlameSpritePosition(spriteIndex);
            this.renderSpriteEntity(flameSprite, this.getRasterPosition(player.playerInGame.startPosition), {
                spritePosition: flamePosition,
                spriteDimensions: {
                    x: FLAME_WIDTH,
                    y: FLAME_HEIGHT,
                },
            });
        }
    }

    private renderEntity(image: CanvasImageSource, canvasPosition: Vec2) {
        const tileDimension = this.gameMapService.getTileDimension();
        this.ctx.drawImage(image, canvasPosition.x, canvasPosition.y, tileDimension, tileDimension);
    }

    private renderSpriteEntity(image: CanvasImageSource, canvasPosition: Vec2, spritePosInfo: SpritePositionInfo) {
        const tileDimension = this.gameMapService.getTileDimension();

        this.ctx.drawImage(
            image,
            spritePosInfo.spritePosition.x,
            spritePosInfo.spritePosition.y,
            spritePosInfo.spriteDimensions.x,
            spritePosInfo.spriteDimensions.y,
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
        if (this.renderingStateService.displayItemTiles) {
            this.renderItemTiles();
            this.renderItemAffectedTiles();
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
