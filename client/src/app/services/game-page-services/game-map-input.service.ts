import { inject, Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent, MapMouseEventButton } from '@app/interfaces/map-mouse-event';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { TILE_COSTS, TileTerrain } from '@common/enums/tile-terrain.enum';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { PlayerInfo } from '@common/interfaces/player';
import { TileInfo } from '@common/interfaces/map';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    playerInfoClick$ = new Subject<PlayerInfo | null>();
    tileInfoClick$ = new Subject<TileInfo>();

    private playerListService = inject(PlayerListService);
    private myPlayerService = inject(MyPlayerService);
    private renderingState = inject(RenderingStateService);
    private gameMapService = inject(GameMapService);
    private movementService = inject(MovementService);
    private gameSocketLogicService = inject(GameLogicSocketService);
    private fightSocketService = inject(FightSocketService);

    getMouseLocation(canvas: HTMLCanvasElement, event: MouseEvent): Vec2 {
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const normalizedX = (x / rect.width) * MAP_PIXEL_DIMENSION;
        const normalizedY = (y / rect.height) * MAP_PIXEL_DIMENSION;

        const finalX = Math.max(0, Math.min(Math.round(normalizedX), MAP_PIXEL_DIMENSION));
        const finalY = Math.max(0, Math.min(Math.round(normalizedY), MAP_PIXEL_DIMENSION));

        return this.convertToTilePosition({ x: finalX, y: finalY });
    }

    onMapClick(event: MapMouseEvent) {
        if (event.button === MapMouseEventButton.Left) {
            this.playClickHandler(event);
        } else if (event.button === MapMouseEventButton.Right) {
            this.infoClickHandler(event);
        }
    }

    onMapHover(event: MapMouseEvent) {
        this.renderingState.hoveredTile = event.tilePosition;
        this.renderingState.arrowHead = null;
        if (!this.movementService.isMoving() && this.myPlayerService.isCurrentPlayer) {
            this.computeArrow(event);
        }
    }

    private computeArrow(event: MapMouseEvent) {
        this.renderingState.playableTiles.forEach((tile) => {
            if (tile.position.x === event.tilePosition.x && tile.position.y === event.tilePosition.y) {
                this.renderingState.arrowHead = tile;
            }
        });
    }

    private playClickHandler(event: MapMouseEvent) {
        if (this.movementService.isMoving()) return;
        const clickedPosition = event.tilePosition;
        const hadAction = this.handleActionTiles(clickedPosition);
        if (!hadAction) {
            this.handleMovementTiles(clickedPosition);
        }
    }

    private getPlayerInfo(tile: Vec2): PlayerInfo | null {
        for (const player of this.playerListService.playerList) {
            if (player.playerInGame.currentPosition.x === tile.x && player.playerInGame.currentPosition.y === tile.y) {
                return player.playerInfo;
            }
        }
        return null;
    }

    private getTileInfo(tile: Vec2): TileInfo {
        const tileInfo: TileInfo = {
            tileTerrain: TileTerrain.Grass,
            cost: 0,
        };
        const tileType = this.gameMapService.map.mapArray[tile.y][tile.x];
        tileInfo.tileTerrain = tileType;
        tileInfo.cost = TILE_COSTS[tileType];
        return tileInfo;
    }

    private infoClickHandler(event: MapMouseEvent) {
        if (this.movementService.isMoving()) return;
        const clickedPosition = event.tilePosition;
        if (this.doesTileHavePlayer(clickedPosition)) {
            const playerInfo = this.getPlayerInfo(clickedPosition);
            this.playerInfoClick$.next(playerInfo);
        } else {
            const tileInfo = this.getTileInfo(clickedPosition);
            this.tileInfoClick$.next(tileInfo);
        }
    }

    private handleActionTiles(clickedPosition: Vec2): boolean {
        for (const tile of this.renderingState.actionTiles) {
            if (tile.x === clickedPosition.x && tile.y === clickedPosition.y) {
                const opponentName = this.getPlayerNameOnTile(clickedPosition);
                if (opponentName) {
                    this.fightSocketService.sendDesiredFight(opponentName);
                    this.renderingState.actionTiles = [];
                } else {
                    this.gameSocketLogicService.sendOpenDoor(tile);
                    this.renderingState.actionTiles = [];
                }
                return true;
            }
        }
        return false;
    }

    private handleMovementTiles(clickedPosition: Vec2) {
        const playableTile = this.getPlayableTile(clickedPosition);
        if (playableTile) {
            this.gameSocketLogicService.processMovement(playableTile.position);
            this.renderingState.playableTiles = [];
            this.renderingState.actionTiles = [];
            this.renderingState.arrowHead = null;
        }
    }

    private getPlayableTile(position: Vec2): ReachableTile | null {
        if (this.doesTileHavePlayer(position)) {
            return null;
        }
        for (const tile of this.renderingState.playableTiles) {
            if (tile.position.x === position.x && tile.position.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    private getPlayerNameOnTile(tilePosition: Vec2): string | null {
        const player = this.playerListService.playerList.find(
            (gamePlayer) =>
                gamePlayer.playerInGame.currentPosition.x === tilePosition.x &&
                gamePlayer.playerInGame.currentPosition.y === tilePosition.y &&
                !gamePlayer.playerInGame.hasAbandoned,
        );

        return player ? player.playerInfo.userName : null;
    }

    private doesTileHavePlayer(tilePosition: Vec2): boolean {
        return this.getPlayerNameOnTile(tilePosition) !== null;
    }

    private convertToTilePosition(position: Vec2) {
        return {
            x: Math.floor(position.x / this.gameMapService.getTileDimension()),
            y: Math.floor(position.y / this.gameMapService.getTileDimension()),
        };
    }
}
