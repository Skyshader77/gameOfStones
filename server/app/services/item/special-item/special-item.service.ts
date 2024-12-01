import { BOMB_LARGE_MAP_RANGE, BOMB_MEDIUM_MAP_RANGE, BOMB_SMALL_MAP_RANGE } from '@app/constants/item.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { getAdjacentPositions, isAnotherPlayerPresentOnTile, isTileUnavailable } from '@app/utils/utilities';
import { MapSize } from '@common/enums/map-size.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { ItemAction } from '@common/interfaces/overworld-action';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SpecialItemService {
    determineBombRange(mapSize: number) {
        switch (mapSize) {
            case MapSize.Small:
                return BOMB_SMALL_MAP_RANGE;
            case MapSize.Medium:
                return BOMB_MEDIUM_MAP_RANGE;
            case MapSize.Large:
                return BOMB_LARGE_MAP_RANGE;
        }
    }

    isTileInBombRange(playerPosition: Vec2, tilePosition: Vec2, mapSize: number): boolean {
        if (tilePosition.x === playerPosition.x && tilePosition.y === playerPosition.y) return false;
        const range = this.determineBombRange(mapSize);
        const dx = playerPosition.x - tilePosition.x;
        const dy = playerPosition.y - tilePosition.y;

        return dx * dx + dy * dy <= range * range;
    }

    determineBombAffectedTiles(playerPosition: Vec2, map: Map): ItemAction {
        const affectedTiles: Vec2[] = [];

        for (let x = 0; x < map.size; x++) {
            for (let y = 0; y < map.size; y++) {
                if (this.isTileInBombRange(playerPosition, { x, y }, map.size)) {
                    affectedTiles.push({ x, y });
                }
            }
        }
        return { overWorldAction: { action: OverWorldActionType.Bomb, position: playerPosition }, affectedTiles };
    }

    areAnyPlayersInBombRange(playerPosition: Vec2, map: Map, room: RoomGame): boolean {
        const { affectedTiles } = this.determineBombAffectedTiles(playerPosition, map);

        const currentPositions = room.players
            .filter((player) => player.playerInfo.userName !== room.game.currentPlayer)
            .map((player) => player.playerInGame.currentPosition);

        return currentPositions.some((position) => affectedTiles.some((tile) => this.arePositionsEqual(position, tile)));
    }

    handleHammerActionTiles(currentPlayer: Player, room: RoomGame, actions: ItemAction[]) {
        for (const tile of getAdjacentPositions(currentPlayer.playerInGame.currentPosition)) {
            if (isAnotherPlayerPresentOnTile(tile, room.players)) {
                actions.push(this.determineHammerAffectedTiles(currentPlayer, tile, room));
            }
        }
    }

    determineHammerAffectedTiles(currentPlayer: Player, tile: Vec2, room: RoomGame): ItemAction {
        const currentPlayerPosition: Vec2 = { x: currentPlayer.playerInGame.currentPosition.x, y: currentPlayer.playerInGame.currentPosition.y };
        const hitPlayer: Vec2 = { x: tile.x, y: tile.y };

        const directionVec = { x: hitPlayer.x - currentPlayerPosition.x, y: hitPlayer.y - currentPlayerPosition.y };

        const mapArray = room.game.map.mapArray;
        const currentTile: Vec2 = { x: hitPlayer.x, y: hitPlayer.y };
        const affectedTiles: Vec2[] = [];
        let isObstacleHit = false;

        while (!isObstacleHit) {
            currentTile.x += directionVec.x;
            currentTile.y += directionVec.y;

            if ([TileTerrain.Wall, TileTerrain.ClosedDoor].includes(mapArray[currentTile.y][currentTile.x])) {
                break;
            }

            affectedTiles.push({ x: currentTile.x, y: currentTile.y });

            const players = room.players;
            if (isTileUnavailable(currentTile, mapArray, players) || this.isTileAtEdgeOfMap(room.game.map, currentTile)) {
                isObstacleHit = true;
            }
        }
        return { overWorldAction: { action: OverWorldActionType.Hammer, position: tile }, affectedTiles };
    }

    private isTileAtEdgeOfMap(map: Map, tile: Vec2): boolean {
        return tile.x % (map.size - 1) === 0 || tile.y % (map.size - 1) === 0;
    }

    private arePositionsEqual(pos1: Vec2, pos2: Vec2): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
}
