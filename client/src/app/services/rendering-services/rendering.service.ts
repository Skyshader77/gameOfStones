import { Injectable } from '@angular/core';
import { directionToVec2Map } from '@app/constants/conversion.constants';
import { SpriteSheetChoice } from '@app/constants/player.constants';
import { FRAME_LENGTH, IDLE_FRAMES, MOVEMENT_FRAMES, RASTER_DIMENSION } from '@app/constants/rendering.constants';
import { PlayerInGame } from '@app/interfaces/player';
import { Direction } from '@app/interfaces/reachable-tiles';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Map } from '@common/interfaces/map';

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
            const hoverX = this.getRasterPosition(this._mapRenderingStateService.hoveredTile.x, tileDimension, 0);
            const hoverY = this.getRasterPosition(this._mapRenderingStateService.hoveredTile.y, tileDimension, 0);

            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fillRect(hoverX, hoverY, tileDimension, tileDimension);
        }
    }

    renderPlayableTiles(): void {
        if (this._mapRenderingStateService.playableTiles.length > 0) {
            const tileDimension = this.getTileDimension();
            for (const tile of this._mapRenderingStateService.playableTiles) {
                const hoverX = this.getRasterPosition(tile.x, tileDimension, 0);
                const hoverY = this.getRasterPosition(tile.y, tileDimension, 0);

                this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                this.ctx.fillRect(hoverX, hoverY, tileDimension, tileDimension);
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
        let speed: Vec2 = { x: 1, y: 1 };
        const playerIndex = this._mapRenderingStateService.players.indexOf(player);

        if (playerIndex === -1) {
            return;
        }

        switch (direction) {
            case Direction.UP:
                player.renderInfo.spriteSheet = SpriteSheetChoice.NINJA_UP;
                speed = directionToVec2Map[Direction.UP];
                break;
            case Direction.DOWN:
                player.renderInfo.spriteSheet = SpriteSheetChoice.NINJA_DOWN;
                speed = directionToVec2Map[Direction.DOWN];
                break;
            case Direction.LEFT:
                player.renderInfo.spriteSheet = SpriteSheetChoice.NINJA_LEFT;
                speed = directionToVec2Map[Direction.LEFT];
                break;
            case Direction.RIGHT:
                player.renderInfo.spriteSheet = SpriteSheetChoice.NINJA_RIGHT;
                speed = directionToVec2Map[Direction.RIGHT];
                break;
        }

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
                        this.renderEntity(terrainImg, { x: j, y: i }, this.getTileDimension());
                    }
                }
            }
        }
    }

    renderItems(gameMap: Map) {
        for (const item of gameMap.placedItems) {
            const itemSprite = this._spriteService.getItemSprite(item.type);
            if (itemSprite) {
                this.renderEntity(itemSprite, item.position, this.getTileDimension());
            }
        }
    }

    renderPlayers() {
        for (const player of this._mapRenderingStateService.players) {
            const playerSprite = this._spriteService.getPlayerSprite(player.renderInfo.spriteSheet);
            if (playerSprite) {
                this.renderEntity(playerSprite, player.currentPosition, this.getTileDimension(), player.renderInfo.offset);
            }
        }
    }

    renderEntity(image: CanvasImageSource, tilePosition: Vec2, tileDimension: number, offset: Vec2 = { x: 0, y: 0 }) {
        if (image) {
            this.ctx.drawImage(
                image,
                this.getRasterPosition(tilePosition.x, tileDimension, offset.x),
                this.getRasterPosition(tilePosition.y, tileDimension, offset.y),
                tileDimension,
                tileDimension,
            );
        }
    }

    private getTileDimension(): number {
        if (this._mapRenderingStateService.map) {
            return RASTER_DIMENSION / this._mapRenderingStateService.map.size;
        } else {
            return 0;
        }
    }

    private getRasterPosition(tilePosition: number, tileDimension: number, offset: number): number {
        return tilePosition * tileDimension + offset;
    }
}
