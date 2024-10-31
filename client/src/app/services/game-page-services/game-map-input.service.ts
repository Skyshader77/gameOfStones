import { Injectable } from '@angular/core';
import { MapMouseEvent } from '@app/interfaces/map';
import { ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    private currentPlayerIndex: number = 0;

    constructor(private mapState: MapRenderingStateService) {}

    onMapClick(event: MapMouseEvent) {
        if (!this.mapState.isMoving) {
            const clickedPosition = event.tilePosition;

            const currentPlayer = this.mapState.players.find((player) => player.isCurrentPlayer);
            if (!currentPlayer) {
                return;
            }
            // const clickedPlayer = this.mapState.players.find(
            //     (player) => player.currentPosition.x === clickedPosition.x && player.currentPosition.y === clickedPosition.y,
            // );

            // if (clickedPlayer === currentPlayer) {
            //     if (this.mapState.playableTiles.length === 0) {
            //         this.mapState.playableTiles = Pathfinding.dijkstraReachableTiles(
            //             this.mapState.map.mapArray,
            //             currentPlayer.currentPosition,
            //             currentPlayer.remainingSpeed,
            //         );
            //     }
            //     return;
            // }

            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    if (this.doesTileHavePlayer(playableTile)) {
                        playableTile.path.pop();
                        currentPlayer.isFighting = true;
                    }
                    for (const direction of playableTile.path) {
                        this.mapState.playerMovementsQueue.push({
                            player: currentPlayer,
                            direction,
                        });
                    }
                    if (playableTile.remainingSpeed === 0) {
                        this.mapState.players[this.currentPlayerIndex].isCurrentPlayer = false;
                        this.mapState.players[this.currentPlayerIndex].remainingSpeed = currentPlayer.movementSpeed;
                        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.mapState.players.length;
                        this.mapState.players[this.currentPlayerIndex].isCurrentPlayer = true;
                    } else {
                        this.mapState.players[this.currentPlayerIndex].remainingSpeed = playableTile.remainingSpeed;
                    }
                }
                this.mapState.playableTiles = [];
            }
        }
    }

    doesTileHavePlayer(tile: ReachableTile): boolean {
        for (const player of this.mapState.players) {
            if (player.currentPosition.x === tile.pos.x && player.currentPosition.y === tile.pos.y) {
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
