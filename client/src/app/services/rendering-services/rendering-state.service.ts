import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Map } from '@common/interfaces/map';
import { Direction, MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    players: Player[] = [];
    isMoving = false;
    arrowHead: ReachableTile | null = null;
    playerMovementsQueue: { player: Player; direction: Direction }[] = [];
    movementServiceOutput: MovementServiceOutput;
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
    map: Map;
    possibleMovementListener: Subscription;
    actionTiles: Vec2[] = [];

    constructor(private gameSocketService: GameLogicSocketService) {}

    initialize() {
        this.possibleMovementListener = this.gameSocketService.listenToPossiblePlayerMovement().subscribe((playableTiles: ReachableTile[]) => {
            this.playableTiles = playableTiles;
        });
    }

    cleanup() {
        this.possibleMovementListener.unsubscribe();
    }
}
