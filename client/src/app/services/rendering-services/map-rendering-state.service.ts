import { Injectable } from '@angular/core';
import { Player, PlayerInGame } from '@app/interfaces/player';
import { Direction, ReachableTile } from '@app/interfaces/reachable-tiles';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    players: Player[] = [];
    isMoving = false;
    playerMovementsQueue: { player: PlayerInGame; direction: Direction }[] = [];
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
}
