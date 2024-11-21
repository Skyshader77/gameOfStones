import { Injectable } from '@angular/core';
import { ReachableTile } from '@common/interfaces/move';
import { OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    arrowHead: ReachableTile | null;
    hoveredTile: Vec2 | null;
    playableTiles: ReachableTile[];
    actionTiles: OverWorldAction[];
    displayPlayableTiles: boolean;
    displayActions: boolean;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.arrowHead = null;
        this.hoveredTile = null;
        this.playableTiles = [];
        this.actionTiles = [];
        this.displayPlayableTiles = false;
        this.displayActions = false;
    }
}
