import { BOMB_LARGE_MAP_RANGE, BOMB_MEDIUM_MAP_RANGE, BOMB_SMALL_MAP_RANGE } from '@app/constants/item.constants';
import { RoomGame } from '@app/interfaces/room-game';
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

    determineHammerAffectedTiles(currentPlayer: Player, tile: Vec2, room: RoomGame): ItemAction {
        const currentPlayerPosition: Vec2 = { x: currentPlayer.playerInGame.currentPosition.x, y: currentPlayer.playerInGame.currentPosition.y };
        const hitPlayer: Vec2 = { x: tile.x, y: tile.y };

        const directionVec = { x: hitPlayer.x - currentPlayerPosition.x, y: hitPlayer.y - currentPlayerPosition.y };

        const mapArray = room.game.map.mapArray;
        const currentTile: Vec2 = { x: hitPlayer.x, y: hitPlayer.y };
        const affectedTiles: Vec2[] = [];
        let isFinished = false;

        while (!isFinished) {
            currentTile.x += directionVec.x;
            currentTile.y += directionVec.y;
            affectedTiles.push({ x: currentTile.x, y: currentTile.y });

            const players = room.players;

            players.map((player) => {
                if (player.playerInGame.currentPosition.x === currentTile.x && player.playerInGame.currentPosition.y === currentTile.y) {
                    isFinished = true;
                }
            });
            if (mapArray[currentTile.y][currentTile.x] === TileTerrain.Wall) {
                isFinished = true;
            } else if (mapArray[currentTile.y][currentTile.x] === TileTerrain.ClosedDoor) {
                isFinished = true;
            } else if (
                currentTile.x === 0 ||
                currentTile.y === 0 ||
                currentTile.x === mapArray[0].length - 1 ||
                currentTile.y === mapArray.length - 1
            ) {
                isFinished = true;
            }
        }
        return { overWorldAction: { action: OverWorldActionType.Hammer, position: tile }, affectedTiles };
    }
}
