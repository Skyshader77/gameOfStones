import { Injectable } from '@angular/core';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    private currentPlayerIndex: number = 0;
    private movePreviewSubscription: Subscription;
    private moveExecutionSubscription: Subscription;
    constructor(
        private mapState: MapRenderingStateService,
        private gameLogicService: GameLogicSocketService,
    ) {}

    initializeApp() {
        this.movePreviewSubscription = this.gameLogicService.listenToMovementPreview().subscribe((reachableTiles: ReachableTile[]) => {
            this.mapState.playableTiles = reachableTiles;
        });

        this.moveExecutionSubscription = this.gameLogicService.listenToPlayerMove().subscribe((actualMovement: MovementServiceOutput) => {
            this.mapState.movementServiceOutput = actualMovement;
        });
    }

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
            if (player.currentPosition.x === tile.position.x && player.currentPosition.y === tile.position.y) {
                return true;
            }
        }
        return false;
    }

    getPlayableTile(position: Vec2): ReachableTile | null {
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
    }
}
