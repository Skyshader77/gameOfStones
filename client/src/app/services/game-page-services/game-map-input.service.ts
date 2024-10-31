import { Injectable } from '@angular/core';

import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { Subscription } from 'rxjs';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { Vec2 } from '@common/interfaces/vec2';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    currentPlayerName: string;
    private movePreviewSubscription: Subscription;
    private moveExecutionSubscription: Subscription;
    private movementSubscription: Subscription;
    constructor(
        private mapState: MapRenderingStateService,
        private gameLogicService: GameLogicSocketService,
        private myPlayerService: MyPlayerService,
        private gameMapService: GameMapService,
        private movementService: MovementService,
        private gameSocketLogicService: GameLogicSocketService,
    ) {
        this.movementSubscription = this.gameSocketLogicService.listenToPlayerMove().subscribe((movement: MovementServiceOutput) => {
            for (const direction of movement.optimalPath.path) {
                this.mapState.playerMovementsQueue.push({
                    player: this.myPlayerService.myPlayer,
                    direction,
                });
            }
        });
    }

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
                    // for (const direction of playableTile.path) {
                    //     this.movementService.addNewPlayerMove(currentPlayer, direction);
                    // }
                    // if (playableTile.remainingSpeed === 0) {
                    //     this.mapState.players[this.currentPlayerIndex].playerInGame.isCurrentPlayer = false;
                    //     this.mapState.players[this.currentPlayerIndex].playerInGame.remainingMovement = currentPlayer.playerInGame.movementSpeed;
                    //     this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.mapState.players.length;
                    //     this.mapState.players[this.currentPlayerIndex].playerInGame.isCurrentPlayer = true;
                    // } else {
                    //     this.mapState.players[this.currentPlayerIndex].playerInGame.remainingMovement = playableTile.remainingSpeed;
                    // }
                }
                this.mapState.playableTiles = [];
            } else {
                // TO DO: check if player has clicked on Action Button beforehand
                // if (this.isPlayerNextToDoor(clickedPosition, this.mapState.players[currentPlayerIndex].playerInGame.currentPosition)){
                //     this.gameSocketLogicService.sendOpenDoor(clickedPosition);
                // }
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
        this.movementSubscription.unsubscribe();
    }
}
