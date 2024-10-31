import { Injectable } from '@angular/core';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    private currentPlayerIndex: number = 0;
    private movePreviewSubscription: Subscription;
    private moveExecutionSubscription: Subscription;
    private movementListener: Subscription;
    constructor(
        private mapState: MapRenderingStateService,
        private gameLogicService: GameLogicSocketService,
        private myPlayerService: MyPlayerService,
        private gameSocketLogicService: GameLogicSocketService,
    ) {
        this.movementListener = this.gameSocketLogicService.listenToPlayerMove().subscribe((movement: MovementServiceOutput) => {
            for (const direction of movement.optimalPath.path) {
                this.mapState.playerMovementsQueue.push({
                    player: this.myPlayerService.myPlayer,
                    direction,
                });
            }
        });
    }

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

            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    this.gameLogicService.processMovement({
                        destination: playableTile.position,
                        playerId: this.myPlayerService.myPlayer.playerInfo.id,
                    });

                    if (playableTile.remainingSpeed === 0) {
                        this.mapState.players[this.currentPlayerIndex].playerInGame.isCurrentPlayer = false;
                        this.mapState.players[this.currentPlayerIndex].playerInGame.remainingSpeed =
                            this.myPlayerService.myPlayer.playerInGame.movementSpeed;
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
            if (player.playerInGame.currentPosition.x === tile.position.x && player.playerInGame.currentPosition.y === tile.position.y) {
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
        this.movementListener.unsubscribe();
    }
}
