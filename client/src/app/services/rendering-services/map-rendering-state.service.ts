import { Injectable } from '@angular/core';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
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

    updatePosition(playerIndex: number, speed: Vec2) {
        this.players[playerIndex].currentPosition.x += speed.x;
        this.players[playerIndex].currentPosition.y += speed.y;
        this.players[playerIndex].renderInfo.offset.x = 0;
        this.players[playerIndex].renderInfo.offset.y = 0;
    }

    movePlayer(playerIndex: number, speed: Vec2, tileDimension: number) {
        this.players[playerIndex].renderInfo.offset.x += (speed.x * tileDimension) / (MOVEMENT_FRAMES - 1);
        this.players[playerIndex].renderInfo.offset.y += (speed.y * tileDimension) / (MOVEMENT_FRAMES - 1);
    }
}
