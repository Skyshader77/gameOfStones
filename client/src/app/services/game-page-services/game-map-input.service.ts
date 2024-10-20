import { Injectable } from '@angular/core';
import { Pathfinding } from '@app/classes/pathfinding';
import { MapMouseEvent } from '@app/interfaces/map';
import { ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MapRenderingStateService } from '../map-rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    constructor(private mapState: MapRenderingStateService) {}

    currentPlayerIndex: number = 0;

    onMapClick(event: MapMouseEvent) {
        if (!this.mapState.isMoving) {
            const clickedPosition = event.tilePosition;

            const currentPlayer = this.mapState.players[this.currentPlayerIndex];
            const clickedPlayer = this.mapState.players.find(
                (player) => player.position.x === clickedPosition.x && player.position.y === clickedPosition.y,
            );

            if (clickedPlayer === currentPlayer) {
                if (this.mapState.playableTiles.length === 0) {
                    this.mapState.playableTiles = Pathfinding.dijkstraReachableTiles(
                        this.mapState.map.mapArray,
                        currentPlayer.position,
                        currentPlayer.playerSpeed,
                    );
                }
                return;
            }

            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    if (this.doesTileHavePlayer(playableTile)) {
                        playableTile.path.pop();
                        currentPlayer.isInCombat = true;
                    }
                    for (const direction of playableTile.path) {
                        this.mapState.playerMovementsQueue.push({
                            player: currentPlayer,
                            direction: direction,
                        });
                    }
                    this.mapState.players[this.currentPlayerIndex].isPlayerTurn = false;
                    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.mapState.players.length;
                    this.mapState.players[this.currentPlayerIndex].isPlayerTurn = true;
                }
                this.mapState.playableTiles = [];
            }
        }
    }

    doesTileHavePlayer(tile: ReachableTile): boolean {
        for (const player of this.mapState.players) {
            if (player.position.x === tile.x && player.position.y === tile.y) {
                return true;
            }
        }
        return false;
    }

    getPlayableTile(position: Vec2): ReachableTile | null {
        for (const tile of this.mapState.playableTiles) {
            if (tile.x === position.x && tile.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    onMapHover(event: MapMouseEvent) {
        this.mapState.hoveredTile = event.tilePosition;
    }
}
