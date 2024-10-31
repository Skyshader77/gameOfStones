import { Injectable } from '@angular/core';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Direction, MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapRenderingStateService {
    map: Map;
    players: Player[] = [];
    isMoving = false;
    playerMovementsQueue: { player: Player; direction: Direction }[] = [];
    movementServiceOutput: MovementServiceOutput;
    hoveredTile: Vec2;
    playableTiles: ReachableTile[] = [];

    updatePosition(playerIndex: number, speed: Vec2) {
        this.players[playerIndex].playerInGame.currentPosition.x += speed.x;
        this.players[playerIndex].playerInGame.currentPosition.y += speed.y;
        this.players[playerIndex].playerInGame.renderInfo.offset.x = 0;
        this.players[playerIndex].playerInGame.renderInfo.offset.y = 0;
    }

    movePlayer(playerIndex: number, speed: Vec2, tileDimension: number) {
        this.players[playerIndex].playerInGame.renderInfo.offset.x += (speed.x * tileDimension) / (MOVEMENT_FRAMES - 1);
        this.players[playerIndex].playerInGame.renderInfo.offset.y += (speed.y * tileDimension) / (MOVEMENT_FRAMES - 1);
    }

    updateDoorState(tileType: TileTerrain, position:Vec2){
        this.map.mapArray[position.x][position.y]=tileType;
    }
}
