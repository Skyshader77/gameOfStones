import { Injectable } from '@angular/core';
import { directionToVec2Map } from '@app/constants/conversion-consts';
import { FRAME_LENGTH, IDLE_FRAMES, MOVEMENT_FRAMES, RASTER_DIMENSION } from '@app/constants/rendering.constants';
import { Player, PlayerSprite } from '@app/interfaces/player';
import { Direction } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MapRenderingStateService } from './map-rendering-state.service';
import { SpriteService } from './sprite.service';

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

    renderMovement(direction: Direction, player: Player) {
        let speed: Vec2 = { x: 1, y: 1 };
        const playerIndex = this._mapRenderingStateService.players.indexOf(player);

        if (playerIndex === -1) {
            return;
        }

        switch (direction) {
            case Direction.UP:
                player.playerSprite = PlayerSprite.NINJA_UP;
                speed = directionToVec2Map[Direction.UP];
                break;
            case Direction.DOWN:
                player.playerSprite = PlayerSprite.NINJA_DOWN;
                speed = directionToVec2Map[Direction.DOWN];
                break;
            case Direction.LEFT:
                player.playerSprite = PlayerSprite.NINJA_LEFT;
                speed = directionToVec2Map[Direction.LEFT];
                break;
            case Direction.RIGHT:
                player.playerSprite = PlayerSprite.NINJA_RIGHT;
                speed = directionToVec2Map[Direction.RIGHT];
                break;
        }

        if (this.frames % MOVEMENT_FRAMES === 0) {
            if (this.timeout % IDLE_FRAMES === 0) {
                this.timeout = 1;
                this.frames = 1;
                this._mapRenderingStateService.players[playerIndex].position.x += speed.x;
                this._mapRenderingStateService.players[playerIndex].position.y += speed.y;
                this._mapRenderingStateService.players[playerIndex].offset.x = 0;
                this._mapRenderingStateService.players[playerIndex].offset.y = 0;
                this._mapRenderingStateService.playerMovementsQueue.shift();
            } else {
                this.timeout++;
            }
        } else {
            this._mapRenderingStateService.players[playerIndex].offset.x += (speed.x * this.getTileDimension()) / (MOVEMENT_FRAMES - 1);
            this._mapRenderingStateService.players[playerIndex].offset.y += (speed.y * this.getTileDimension()) / (MOVEMENT_FRAMES - 1);

            this.frames++;
        }
    }

    stopRendering() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (this._spriteService.isLoaded()) {
            this.renderTiles();
            this.renderPlayers();
        }
    }

    renderTiles() {
        if (this._mapRenderingStateService.map) {
            const tileDimension = this.getTileDimension();
            const tiles = this._mapRenderingStateService.map?.mapArray;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    const tile = tiles[i][j];
                    const terrainImg = this._spriteService.getTileSprite(tile.terrain);
                    if (terrainImg) {
                        this.renderEntity(terrainImg, { x: i, y: j }, tileDimension, { x: 0, y: 0 });
                    }
                    const itemImg = this._spriteService.getItemSprite(tile.item);
                    if (itemImg) {
                        this.renderEntity(itemImg, { x: i, y: j }, tileDimension, { x: 0, y: 0 });
                    }
                }
            }
        }
    }

    renderPlayers() {
        for (const player of this._mapRenderingStateService.players) {
            const playerSprite = this._spriteService.getPlayerSprite(player.playerSprite);
            if (playerSprite) {
                this.renderEntity(playerSprite, player.position, this.getTileDimension(), player.offset);
            }
            if (player.isPlayerTurn) {
                const tileDimension = this.getTileDimension();
                const playerX = this.getRasterPosition(player.position.x, tileDimension, 0);
                const playerY = this.getRasterPosition(player.position.y, tileDimension, 0);

                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                this.ctx.fillRect(playerX, playerY, tileDimension, tileDimension);
            }
        }
    }

    renderEntity(image: CanvasImageSource, tilePosition: Vec2, tileDimension: number, offset: Vec2) {
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
