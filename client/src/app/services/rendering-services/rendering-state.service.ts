import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION, SQUARE_SIZE } from '@app/constants/rendering.constants';
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
    isInFightTransition = false;
    fightStarted = false;
    xSquare = MAP_PIXEL_DIMENSION - SQUARE_SIZE;
    transitionTimeout = 0;
    ySquare = 0;
    top = 0;
    bottom = MAP_PIXEL_DIMENSION;
    left = 0;
    right = MAP_PIXEL_DIMENSION;

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
