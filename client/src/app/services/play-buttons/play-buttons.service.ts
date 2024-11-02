import { inject, Injectable } from '@angular/core';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { directionToVec2Map } from '@common/interfaces/move';

@Injectable({
    providedIn: 'root',
})
export class PlayButtonsService {
    private playerListService = inject(PlayerListService);
    private myPlayer = inject(MyPlayerService);
    private mapRendererState = inject(MapRenderingStateService);
    private mapState = inject(GameMapService);

    isActionTile(tileX: number, tileY: number, mapArray: TileTerrain[][]): boolean {
        return mapArray[tileY]?.[tileX] === TileTerrain.OPENDOOR || mapArray[tileY]?.[tileX] === TileTerrain.CLOSEDDOOR;
    }

    clickActionButton() {
        if (!this.myPlayer.isCurrentPlayer) return;

        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer) return;

        this.mapRendererState.actionTiles = [];
        const { x, y } = currentPlayer.playerInGame.currentPosition;
        const mapArray = this.mapState.map?.mapArray;
        if (!mapArray) return;

        Object.values(directionToVec2Map).forEach(({ x: dx, y: dy }) => {
            const adjX = x + dx;
            const adjY = y + dy;

            if (this.isActionTile(adjX, adjY, mapArray)) {
                this.mapRendererState.actionTiles.push({ x: adjX, y: adjY });
            }

            if (
                this.playerListService.playerList.some(
                    (player) => player.playerInGame.currentPosition.x === adjX && player.playerInGame.currentPosition.y === adjY,
                )
            ) {
                this.mapRendererState.actionTiles.push({ x: adjX, y: adjY });
            }
        });
    }
}
