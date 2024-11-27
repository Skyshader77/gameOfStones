import { RoomGame } from '@app/interfaces/room-game';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { directionToVec2Map } from '@common/interfaces/move';
import { OverWorldAction } from '@common/interfaces/overworld-action';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActionService {
    hasNoPossibleAction(room: RoomGame, currentPlayer: Player): boolean {
        return !this.isNextToActionTile(room, currentPlayer) || currentPlayer.playerInGame.remainingActions === 0;
    }

    isNextToActionTile(room: RoomGame, currentPlayer: Player): boolean {
        return this.getAdjacentPositions(currentPlayer.playerInGame.currentPosition)
            .filter((pos) => isCoordinateWithinBoundaries(pos, room.game.map.mapArray))
            .some((pos) => this.isActionTile(pos, room));
    }

    isActionTile(position: Vec2, room: RoomGame): boolean {
        return this.getActionTileType(position, room.players, room.game.map) in OverWorldActionType;
    }

    getOverWorldActions(currentPlayer: Player, room: RoomGame): OverWorldAction[] {
        if (currentPlayer.playerInGame.remainingActions === 0) return [];

        return this.getFightAndDoorActions(currentPlayer.playerInGame.currentPosition, room.game.map, room.players);
    }

    private getFightAndDoorActions(currentPlayerPosition: Vec2, map: Map, players: Player[]): OverWorldAction[] {
        const actions: OverWorldAction[] = [];
        for (const newPosition of this.getAdjacentPositions(currentPlayerPosition)) {
            if (isCoordinateWithinBoundaries(newPosition, map.mapArray)) {
                const newAction = this.getAction(newPosition, players, map);
                if (newAction) {
                    actions.push(newAction);
                }
            }
        }
        return actions;
    }

    private getAction(position: Vec2, players: Player[], map: Map): OverWorldAction | null {
        let action: OverWorldAction = null;
        const type = this.getActionTileType(position, players, map);
        if (type) {
            action = { action: type, position };
        }

        return action;
    }

    private getActionTileType(position: Vec2, players: Player[], map: Map): OverWorldActionType | null {
        let actionType: OverWorldActionType = null;
        const tile = map.mapArray[position.y][position.x];
        if (isAnotherPlayerPresentOnTile(position, players)) {
            actionType = OverWorldActionType.Fight;
        } else if (tile === TileTerrain.OpenDoor || tile === TileTerrain.ClosedDoor) {
            actionType = OverWorldActionType.Door;
        }
        return actionType;
    }

    // TODO move to utils
    private getAdjacentPositions(position: Vec2): Vec2[] {
        return Object.values(directionToVec2Map).map((delta) => ({
            x: position.x + delta.x,
            y: position.y + delta.y,
        }));
    }
}
