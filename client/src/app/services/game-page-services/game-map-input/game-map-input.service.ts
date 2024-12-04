import { inject, Injectable } from '@angular/core';
import { TERRAIN_TO_STRING_MAP } from '@app/constants/conversion.constants';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent, MapMouseEventButton } from '@app/interfaces/map-mouse-event';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { TILE_COSTS } from '@common/constants/tile.constants';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { ItemUsedPayload } from '@common/interfaces/item';
import { TileInfo } from '@common/interfaces/map';
import { ReachableTile } from '@common/interfaces/move';
import { PlayerInfo } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameMapInputService {
    playerInfoClick$ = new Subject<PlayerInfo | null>();
    tileInfoClick$ = new Subject<TileInfo>();

    private playerListService = inject(PlayerListService);
    private myPlayerService = inject(MyPlayerService);
    private renderingState = inject(RenderingStateService);
    private gameMapService = inject(GameMapService);
    private movementService = inject(MovementService);
    private gameSocketLogicService = inject(GameLogicSocketService);
    private fightSocketService = inject(FightSocketService);
    private debugService = inject(DebugModeService);

    getMouseLocation(canvas: HTMLCanvasElement, event: MouseEvent): Vec2 {
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const normalizedX = (x / rect.width) * MAP_PIXEL_DIMENSION;
        const normalizedY = (y / rect.height) * MAP_PIXEL_DIMENSION;

        const finalX = Math.max(0, Math.min(Math.round(normalizedX), MAP_PIXEL_DIMENSION));
        const finalY = Math.max(0, Math.min(Math.round(normalizedY), MAP_PIXEL_DIMENSION));

        return this.convertToTilePosition({ x: finalX, y: finalY });
    }

    onMapClick(event: MapMouseEvent) {
        if (event.button === MapMouseEventButton.Left) {
            this.playClickHandler(event);
        } else if (event.button === MapMouseEventButton.Right) {
            if (this.debugService.getDebug()) {
                this.debugService.teleport(event.tilePosition);
            } else {
                this.infoClickHandler(event);
            }
        }
    }

    onMapHover(event: MapMouseEvent) {
        this.renderingState.hoveredTile = event.tilePosition;
        this.renderingState.arrowHead = null;
        if (!this.movementService.isMoving() && this.myPlayerService.isCurrentPlayer && this.renderingState.displayPlayableTiles) {
            this.computeArrow(event);
        }
    }

    private computeArrow(event: MapMouseEvent) {
        this.renderingState.playableTiles.forEach((tile) => {
            if (tile.position.x === event.tilePosition.x && tile.position.y === event.tilePosition.y) {
                this.renderingState.arrowHead = tile;
            }
        });
    }

    private playClickHandler(event: MapMouseEvent) {
        if (this.movementService.isMoving()) return;
        const clickedPosition = event.tilePosition;
        let hadItemAction = false;
        const hadAction = this.handleActionTiles(clickedPosition);
        if (!hadAction) {
            hadItemAction = this.handleItemTiles(clickedPosition);
        }
        if (!hadAction && !hadItemAction) this.handleMovementTiles(clickedPosition);
    }

    private getPlayerInfo(tile: Vec2): PlayerInfo | null {
        for (const player of this.playerListService.playerList) {
            if (player.playerInGame.currentPosition.x === tile.x && player.playerInGame.currentPosition.y === tile.y) {
                return player.playerInfo;
            }
        }
        return null;
    }

    private getTileInfo(tile: Vec2): TileInfo {
        const tileInfo: TileInfo = {
            tileTerrainName: '',
            cost: 0,
        };
        const tileType = this.gameMapService.map.mapArray[tile.y][tile.x];
        tileInfo.tileTerrainName = TERRAIN_TO_STRING_MAP[tileType];
        tileInfo.cost = TILE_COSTS[tileType];
        return tileInfo;
    }

    private infoClickHandler(event: MapMouseEvent) {
        if (this.movementService.isMoving()) return;
        const clickedPosition = event.tilePosition;
        if (this.doesTileHavePlayer(clickedPosition)) {
            const playerInfo = this.getPlayerInfo(clickedPosition);
            this.playerInfoClick$.next(playerInfo);
        } else {
            const tileInfo = this.getTileInfo(clickedPosition);
            this.tileInfoClick$.next(tileInfo);
        }
    }

    private handleItemTiles(clickedPosition: Vec2): boolean {
        if (!this.renderingState.displayItemTiles) return false;

        const tile = this.renderingState.itemTiles.find(
            (currentTile) =>
                currentTile.overWorldAction.position.x === clickedPosition.x && currentTile.overWorldAction.position.y === clickedPosition.y,
        );

        if (!tile) return false;

        if (this.renderingState.currentlySelectedItem) {
            const itemUsedPayload: ItemUsedPayload = { usagePosition: clickedPosition, type: this.renderingState.currentlySelectedItem };
            this.gameSocketLogicService.sendItemUsed(itemUsedPayload);
        }

        return true;
    }

    private handleActionTiles(clickedPosition: Vec2): boolean {
        if (!this.renderingState.displayActions) return false;

        const actionTile = this.renderingState.actionTiles.find(
            (tile) => tile.position.x === clickedPosition.x && tile.position.y === clickedPosition.y,
        );

        if (!actionTile) return false;

        if (actionTile.action === OverWorldActionType.Fight) {
            this.fightSocketService.sendDesiredFight(actionTile.position);
            this.renderingState.displayPlayableTiles = false;
        } else {
            this.gameSocketLogicService.sendOpenDoor(actionTile.position);
        }

        return true;
    }

    private handleMovementTiles(clickedPosition: Vec2) {
        if (!this.renderingState.displayPlayableTiles) return;

        const playableTile = this.getPlayableTile(clickedPosition);
        if (playableTile) {
            this.gameSocketLogicService.processMovement(playableTile.position);
            this.renderingState.updateMovement();
        }
    }

    private getPlayableTile(position: Vec2): ReachableTile | null {
        for (const tile of this.renderingState.playableTiles) {
            if (tile.position.x === position.x && tile.position.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    private getPlayerNameOnTile(tilePosition: Vec2): string | null {
        const player = this.playerListService.playerList.find(
            (gamePlayer) =>
                gamePlayer.playerInGame.currentPosition.x === tilePosition.x &&
                gamePlayer.playerInGame.currentPosition.y === tilePosition.y &&
                !gamePlayer.playerInGame.hasAbandoned,
        );

        return player ? player.playerInfo.userName : null;
    }

    private doesTileHavePlayer(tilePosition: Vec2): boolean {
        return this.getPlayerNameOnTile(tilePosition) !== null;
    }

    private convertToTilePosition(position: Vec2) {
        return {
            x: Math.floor(position.x / this.gameMapService.getTileDimension()),
            y: Math.floor(position.y / this.gameMapService.getTileDimension()),
        };
    }
}
