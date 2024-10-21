import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { PlayerInGame } from '@app/interfaces/player';
import { Direction, ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    map: Map;
    players: PlayerInGame[] = [];
    isMoving = false;
    playerMovementsQueue: { player: PlayerInGame; direction: Direction }[] = [];
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
}
