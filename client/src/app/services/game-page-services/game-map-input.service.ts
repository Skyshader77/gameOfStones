import { inject, Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    currentPlayerName: string;
    private movePreviewSubscription: Subscription;
    private moveExecutionSubscription: Subscription;
    private movementSubscription: Subscription;

    private playerListService = inject(PlayerListService);
    private myPlayerService = inject(MyPlayerService);
    private mapState = inject(RenderingStateService);
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

    convertToTilePosition(position: Vec2) {
        return {
            x: Math.floor(position.x / this.gameMapService.getTileDimension()),
            y: Math.floor(position.y / this.gameMapService.getTileDimension()),
        };
    }

    onMapClick(event: MapMouseEvent) {
        if (this.movementService.isMoving()) return;
        const clickedPosition = event.tilePosition;

        const hadAction = this.handleActionTiles(clickedPosition);

        if (!hadAction) {
            this.handleMovementTiles(clickedPosition);
        }
    }

    isPlayerNextToDoor(clickedPosition: Vec2, currentPosition: Vec2): boolean {
        const clickedTileType = this.gameMapService.map.mapArray[clickedPosition.x][clickedPosition.y];
        if (clickedTileType === TileTerrain.ClosedDoor || clickedTileType === TileTerrain.OpenDoor) {
            if (Math.abs(clickedPosition.x - currentPosition.x) === 1 || Math.abs(clickedPosition.y - currentPosition.y) === 1) {
                return true;
            }
        }
        return false;
    }

    getPlayableTile(position: Vec2): ReachableTile | null {
        if (this.doesTileHavePlayer(position)) {
            return null;
        }
        for (const tile of this.mapState.playableTiles) {
            if (tile.position.x === position.x && tile.position.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    onMapHover(event: MapMouseEvent) {
        this.mapState.hoveredTile = event.tilePosition;
        this.mapState.arrowHead = null;
        if (!this.movementService.isMoving() && this.myPlayerService.isCurrentPlayer) {
            this.mapState.playableTiles.forEach((tile) => {
                if (tile.position.x === event.tilePosition.x && tile.position.y === event.tilePosition.y) {
                    this.mapState.arrowHead = tile;
                }
            });
        }
    }

    cleanup(): void {
        this.movePreviewSubscription.unsubscribe();
        this.moveExecutionSubscription.unsubscribe();
        this.movementSubscription.unsubscribe();
    }

    private handleActionTiles(clickedPosition: Vec2): boolean {
        if (this.mapState.actionTiles.length === 0) return false;

        for (const tile of this.mapState.actionTiles) {
            if (tile.x === clickedPosition.x && tile.y === clickedPosition.y) {
                const opponentName = this.getPlayerNameOnTile(clickedPosition);
                if (opponentName) {
                    this.fightSocketService.sendDesiredFight(opponentName);
                    this.mapState.actionTiles = [];
                } else {
                    this.gameSocketLogicService.sendOpenDoor(tile);
                    this.mapState.actionTiles = [];
                }
                return true;
            }
        }
        return false;
    }

    private handleMovementTiles(clickedPosition: Vec2) {
        if (this.mapState.playableTiles.length === 0) return;

        const playableTile = this.getPlayableTile(clickedPosition);
        if (playableTile) {
            this.gameSocketLogicService.processMovement(playableTile.position);
            this.mapState.playableTiles = [];
            this.mapState.actionTiles = [];
            this.mapState.arrowHead = null;
        }
    }

    private getPlayerNameOnTile(tilePosition: Vec2): string | null {
        const player = this.playerListService.playerList.find(
            (gamePlayer) =>
                gamePlayer.playerInGame.currentPosition.x === tilePosition.x && gamePlayer.playerInGame.currentPosition.y === tilePosition.y,
        );

        return player ? player.playerInfo.userName : null;
    }

    private doesTileHavePlayer(tilePosition: Vec2): boolean {
        return this.getPlayerNameOnTile(tilePosition) !== null;
    }
}
