import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Direction, MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    players: Player[] = [];
    isMoving = false;
    playerMovementsQueue: { player: Player; direction: Direction }[] = [];
    movementServiceOutput: MovementServiceOutput;
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
}
