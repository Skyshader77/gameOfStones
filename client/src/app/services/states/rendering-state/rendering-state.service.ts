import { inject, Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION, SQUARE_SIZE } from '@app/constants/rendering.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Direction, PathNode, ReachableTile, vec2ToDirectionMap } from '@common/interfaces/move';
import { ItemAction, OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
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
    xSquare = MAP_PIXEL_DIMENSION - SQUARE_SIZE;
    transitionTimeout = 0;
    ySquare = 0;
    top = 0;
    bottom = MAP_PIXEL_DIMENSION;
    left = 0;
    right = MAP_PIXEL_DIMENSION;
    hammerTiles: PathNode[] = [];
    isHammerMovement = false;
    myPlayer = inject(MyPlayerService);

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

    resetCornerPositions() {
        this.xSquare = MAP_PIXEL_DIMENSION - SQUARE_SIZE;
        this.ySquare = 0;
        this.top = 0;
        this.bottom = MAP_PIXEL_DIMENSION;
        this.left = 0;
        this.right = MAP_PIXEL_DIMENSION;
        this.transitionTimeout = 0;
        // this.direction = Direction.LEFT;
    }

    findHammerTiles(affectedTiles: Vec2[]) {
        if (affectedTiles.length === 0) {
            return;
        }
        const directionX = affectedTiles[1].x - affectedTiles[0].x;
        const directionY = affectedTiles[1].y - affectedTiles[0].y;

        const directionVec = { x: directionX, y: directionY };

        const direction: Direction = this.getDirectionFromVec2(directionVec) as Direction;

        for (let i = affectedTiles.length; i > 0; i--) {
            const pathNode = { direction, remainingMovement: i };
            this.hammerTiles.push(pathNode);
        }
    }

    getDirectionFromVec2(vec: Vec2): Direction | undefined {
        for (const [mapVec, direction] of vec2ToDirectionMap.entries()) {
            if (mapVec.x === vec.x && mapVec.y === vec.y) {
                return direction;
            }
        }
        return undefined;
    }
}
