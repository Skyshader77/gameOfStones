import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map';
import { ReachableTile } from '@app/interfaces/reachable-tiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { MovementService } from '@app/services/movement-service/movement.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    private currentPlayerIndex: number = 0;

    constructor(
        private mapState: MapRenderingStateService,
        private gameMapService: GameMapService,
        private movementService: MovementService,
    ) {}

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

            // TODO use another way
            const currentPlayer = this.mapState.players.find((player) => player.playerInGame.isCurrentPlayer);
            if (!currentPlayer) {
                return;
            }

            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    // TODO not use this
                    // if (this.doesTileHavePlayer(playableTile)) {
                    //     playableTile.path.pop();
                    //     currentPlayer.isFighting = true;
                    // }
                    for (const direction of playableTile.path) {
                        this.movementService.addNewPlayerMove(currentPlayer, direction);
                    }
                    if (playableTile.remainingSpeed === 0) {
                        this.mapState.players[this.currentPlayerIndex].playerInGame.isCurrentPlayer = false;
                        this.mapState.players[this.currentPlayerIndex].playerInGame.remainingSpeed = currentPlayer.playerInGame.movementSpeed;
                        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.mapState.players.length;
                        this.mapState.players[this.currentPlayerIndex].playerInGame.isCurrentPlayer = true;
                    } else {
                        this.mapState.players[this.currentPlayerIndex].playerInGame.remainingSpeed = playableTile.remainingSpeed;
                    }
                }
                this.mapState.playableTiles = [];
            }
        }
    }

    doesTileHavePlayer(tile: ReachableTile): boolean {
        for (const player of this.mapState.players) {
            if (player.playerInGame.currentPosition.x === tile.pos.x && player.playerInGame.currentPosition.y === tile.pos.y) {
                return true;
            }
        }
        return false;
    }

    getPlayableTile(position: Vec2): ReachableTile | null {
        for (const tile of this.mapState.playableTiles) {
            if (tile.pos.x === position.x && tile.pos.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    onMapHover(event: MapMouseEvent) {
        this.mapState.hoveredTile = event.tilePosition;
    }
}
