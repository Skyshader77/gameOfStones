import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION, SQUARE_SIZE } from '@app/constants/rendering.constants';
import { Direction, ReachableTile } from '@common/interfaces/move';
import { OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    direction = Direction.LEFT;
    arrowHead: ReachableTile | null;
    hoveredTile: Vec2 | null;
    playableTiles: ReachableTile[];
    actionTiles: OverWorldAction[];
    counter: number;
    displayPlayableTiles: boolean;
    displayActions: boolean;
    isInFightTransition: boolean;
    fightStarted: boolean;
    xSquare: number;
    transitionTimeout: number;
    ySquare: number;
    top: number;
    bottom: number;
    left: number;
    right: number;

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
        this.fightStarted = false;
        this.isInFightTransition = false;
        this.counter = 0;
        this.resetCornerPositions();
    }

    resetCornerPositions() {
        this.xSquare = MAP_PIXEL_DIMENSION - SQUARE_SIZE;
        this.ySquare = 0;
        this.top = 0;
        this.bottom = MAP_PIXEL_DIMENSION;
        this.left = 0;
        this.right = MAP_PIXEL_DIMENSION;
        this.transitionTimeout = 0;
        this.direction = Direction.LEFT;
    }
}
