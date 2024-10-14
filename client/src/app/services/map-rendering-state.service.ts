import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { Player } from '@app/interfaces/player';
import { ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    map: Map;
    players: Player[] = [];
    isMoving = false;
    playerMovementsQueue: { player: Player; direction: string }[] = [];
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
}
