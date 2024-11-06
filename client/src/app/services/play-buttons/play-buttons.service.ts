import { inject, Injectable } from '@angular/core';
import { RenderingStateService } from '@app/services/rendering-services/rendering-state.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { directionToVec2Map } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayButtonsService {
    private playerListService = inject(PlayerListService);
    private myPlayer = inject(MyPlayerService);
    private renderingState = inject(RenderingStateService);
    private mapState = inject(GameMapService);
    private fightSocketService = inject(FightSocketService);

    clickActionButton() {
        if (!this.myPlayer.isCurrentPlayer) return;

        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer) return;

        this.renderingState.actionTiles = [];
        const mapArray = this.mapState.map.mapArray;

        this.determineActionTiles(currentPlayer.playerInGame.currentPosition, mapArray);
    }

    clickAttackButton() {
        if (this.myPlayer.isCurrentFighter) {
            this.fightSocketService.sendDesiredAttack();
        }
    }

    clickEvadeButton() {
        if (this.myPlayer.isCurrentFighter) {
            this.fightSocketService.sendDesiredEvade();
        }
    }

    private isActionTile(tilePosition: Vec2, mapArray: TileTerrain[][]): boolean {
        return mapArray[tilePosition.y][tilePosition.x] === TileTerrain.OpenDoor ||
            mapArray[tilePosition.y][tilePosition.x] === TileTerrain.ClosedDoor
            ? true
            : this.playerListService.playerList.some(
                  (player) => player.playerInGame.currentPosition.x === tilePosition.x && player.playerInGame.currentPosition.y === tilePosition.y,
              );
    }

    private determineActionTiles(currentPosition: Vec2, mapArray: TileTerrain[][]) {
        Object.values(directionToVec2Map).forEach(({ x: dx, y: dy }) => {
            const adjX = currentPosition.x + dx;
            const adjY = currentPosition.y + dy;
            const adj: Vec2 = { x: adjX, y: adjY };
            if (this.isCoordinateWithinBoundaries(adj, mapArray) && this.isActionTile(adj, mapArray)) {
                this.renderingState.actionTiles.push({ x: adjX, y: adjY });
            }
        });
    }

    private isCoordinateWithinBoundaries(destination: Vec2, map: TileTerrain[][]): boolean {
        return !(destination.x >= map.length || destination.y >= map[0].length || destination.x < 0 || destination.y < 0);
    }
}
