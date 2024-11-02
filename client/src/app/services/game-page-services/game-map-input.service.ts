import { inject, Injectable } from '@angular/core';

import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { PlayerListService } from '@app/services/room-services/player-list.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    currentPlayerName: string;
    private movePreviewSubscription: Subscription;
    private moveExecutionSubscription: Subscription;
    private movementSubscription: Subscription;

    private playerListService = inject(PlayerListService);
    private mapState = inject(MapRenderingStateService);
    private gameMapService = inject(GameMapService);
    private movementService = inject(MovementService);
    private gameSocketLogicService = inject(GameLogicSocketService);

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
        if (!this.movementService.isMoving()) {
            const clickedPosition = event.tilePosition;
            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    this.gameSocketLogicService.processMovement(playableTile.position);
                    this.mapState.playableTiles = [];
                    this.mapState.actionTiles = [];
                }
            }

            if (this.mapState.actionTiles.length > 0) {
                this.mapState.actionTiles.forEach((tile) => {
                    if (tile.x === clickedPosition.x && tile.y === clickedPosition.y) {
                        if (this.doesTileHavePlayer(clickedPosition)) {
                            //this.gameSocketLogicService.processFight(clickedPosition);
                            console.log("Fight not implemented yet");
                        } else {
                            this.gameSocketLogicService.sendOpenDoor(tile);
                        }
                    }
                });
            }
        }
    }

    isPlayerNextToDoor(clickedPosition: Vec2, currentPosition: Vec2): boolean {
        const clickedTileType = this.mapState.map.mapArray[clickedPosition.x][clickedPosition.y];
        if (clickedTileType === TileTerrain.CLOSEDDOOR || clickedTileType === TileTerrain.OPENDOOR) {
            if (Math.abs(clickedPosition.x - currentPosition.x) === 1 || Math.abs(clickedPosition.y - currentPosition.y) === 1) {
                return true;
            }
        }
        return false;
    }

    doesTileHavePlayer(tile: Vec2): boolean {
        for (const player of this.playerListService.playerList) {
            if (player.playerInGame.currentPosition.x === tile.x && player.playerInGame.currentPosition.y === tile.y) {
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
    }

    cleanup(): void {
        this.movePreviewSubscription.unsubscribe();
        this.moveExecutionSubscription.unsubscribe();
        this.movementSubscription.unsubscribe();
    }
}
