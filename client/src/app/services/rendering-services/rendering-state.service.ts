import { Injectable } from '@angular/core';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    arrowHead: ReachableTile | null = null;
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
    actionTiles: Vec2[] = [];
    private possibleMovementListener: Subscription;

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
