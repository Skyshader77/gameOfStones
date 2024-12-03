import { Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION, SQUARE_SIZE } from '@app/constants/rendering.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Direction, directionToVec2Map, PathNode, ReachableTile, vec2ToDirectionMap } from '@common/interfaces/move';
import { ItemAction, OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
import { DeadPlayerPayload } from '@common/interfaces/player';
@Injectable({
    providedIn: 'root',
})
export class RenderingStateService {
    arrowHead: ReachableTile | null;
    hoveredTile: Vec2 | null;
    playableTiles: ReachableTile[];
    actionTiles: OverWorldAction[];
    counter: number;
    itemTiles: ItemAction[];
    currentlySelectedItem: ItemType | null;
    displayItemTiles: boolean;
    displayPlayableTiles: boolean;
    displayActions: boolean;
    isInFightTransition = false;
    deadPlayers: DeadPlayerPayload[] = [];
    fightStarted = false;

    transitionTimeout: number;
    squarePos: Vec2;
    hammerTiles: PathNode[] = [];
    isHammerMovement = false;
    showExplosion = false;
    private direction: Direction;
    private top: number;
    private bottom: number;
    private left: number;
    private right: number;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.arrowHead = null;
        this.hoveredTile = null;
        this.playableTiles = [];
        this.actionTiles = [];
        this.itemTiles = [];
        this.displayPlayableTiles = false;
        this.displayActions = false;
        this.displayItemTiles = false;
        this.currentlySelectedItem = null;
        this.isInFightTransition = false;
        this.fightStarted = false;
        this.counter = 0;
        this.resetCornerPositions();
    }

    findHammerTiles(affectedTiles: Vec2[]) {
        if (affectedTiles.length === 0) {
            return;
        }
        const directionVec = { x: affectedTiles[1].x - affectedTiles[0].x, y: affectedTiles[1].y - affectedTiles[0].y };

        const direction: Direction = this.getDirectionFromVec2(directionVec) as Direction;

        for (let i = affectedTiles.length - 1; i >= 0; i--) {
            const pathNode = { direction, remainingMovement: i };
            this.hammerTiles.push(pathNode);
        }
    }

    updateFightTransition() {
        const delta: Vec2 = directionToVec2Map[this.direction];

        this.squarePos.x += delta.x * SQUARE_SIZE;
        this.squarePos.y += delta.y * SQUARE_SIZE;
        this.updateSquareDirection();

        if (this.left > this.right || this.top > this.bottom) {
            this.isInFightTransition = false;
            this.fightStarted = true;
            this.resetCornerPositions();
            return;
        }
    }

    private updateSquareDirection() {
        if (this.direction === Direction.LEFT && this.squarePos.x <= this.left) {
            this.direction = Direction.DOWN;
            this.squarePos.x = this.left;
            this.top += SQUARE_SIZE;
        } else if (this.direction === Direction.DOWN && this.squarePos.y >= this.bottom - SQUARE_SIZE) {
            this.direction = Direction.RIGHT;
            this.squarePos.y = this.bottom - SQUARE_SIZE;
            this.left += SQUARE_SIZE;
        } else if (this.direction === Direction.RIGHT && this.squarePos.x >= this.right - SQUARE_SIZE) {
            this.direction = Direction.UP;
            this.squarePos.x = this.right - SQUARE_SIZE;
            this.bottom -= SQUARE_SIZE;
        } else if (this.direction === Direction.UP && this.squarePos.y <= this.top) {
            this.direction = Direction.LEFT;
            this.squarePos.y = this.top;
            this.right -= SQUARE_SIZE;
        }
    }

    private resetCornerPositions() {
        this.squarePos = { x: MAP_PIXEL_DIMENSION - SQUARE_SIZE, y: 0 };
        this.top = 0;
        this.bottom = MAP_PIXEL_DIMENSION;
        this.left = 0;
        this.right = MAP_PIXEL_DIMENSION;
        this.transitionTimeout = 0;
        this.direction = Direction.LEFT;
    }

    private getDirectionFromVec2(vec: Vec2): Direction | undefined {
        for (const [mapVec, direction] of vec2ToDirectionMap.entries()) {
            if (mapVec.x === vec.x && mapVec.y === vec.y) {
                return direction;
            }
        }
        return undefined;
    }
}
