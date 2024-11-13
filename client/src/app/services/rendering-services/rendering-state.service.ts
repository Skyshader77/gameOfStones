import { Injectable } from '@angular/core';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    arrowHead: ReachableTile | null = null;
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];
    actionTiles: Vec2[] = [];
    isInFightTransition = false;
    fightStarted = false;
}
