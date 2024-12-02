import { BOMB_LARGE_MAP_RANGE, BOMB_MEDIUM_MAP_RANGE, BOMB_SMALL_MAP_RANGE } from '@app/constants/item.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { findPlayerAtPosition, getAdjacentPositions, isAnotherPlayerPresentOnTile, isTileUnavailable } from '@app/utils/utilities';
import { MapSize } from '@common/enums/map-size.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { ItemAction } from '@common/interfaces/overworld-action';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SpecialItemService {
    @Inject() private roomManagerService: RoomManagerService;

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

    shouldBombKillPlayerOnTile(usagePosition: Vec2, tilePosition: Vec2, room: RoomGame): boolean {
        return (
            (this.isTileInBombRange(usagePosition, tilePosition, room.game.map.size) && isAnotherPlayerPresentOnTile(tilePosition, room.players)) ||
            (tilePosition.x === usagePosition.x && tilePosition.y === usagePosition.y)
        );
    }

    handleBombUsed(room: RoomGame, usagePosition: Vec2): Player[] {
        room.game.isCurrentPlayerDead = true;
        const bombResult: Player[] = [];
        for (let x = 0; x < room.game.map.size; x++) {
            for (let y = 0; y < room.game.map.size; y++) {
                const tilePosition: Vec2 = { x, y };
                if (this.shouldBombKillPlayerOnTile(usagePosition, tilePosition, room)) {
                    const player = findPlayerAtPosition(tilePosition, room);
                    bombResult.push(player);
                }
            }
        }
        return bombResult;
    }

    handleHammerActionTiles(currentPlayer: Player, room: RoomGame): ItemAction[] {
        const actions: ItemAction[] = [];
        for (const tile of getAdjacentPositions(currentPlayer.playerInGame.currentPosition)) {
            if (isAnotherPlayerPresentOnTile(tile, room.players)) {
                actions.push(this.determineHammerAffectedTiles(currentPlayer, tile, room));
            }
        }
        return actions;
    }

    determineHammerAffectedTiles(currentPlayer: Player, hitPosition: Vec2, room: RoomGame): ItemAction {
        const directionVec = {
            x: hitPosition.x - currentPlayer.playerInGame.currentPosition.x,
            y: hitPosition.y - currentPlayer.playerInGame.currentPosition.y,
        };

        const affectedTiles = this.hammerSlide(room, hitPosition, directionVec);
        return { overWorldAction: { action: OverWorldActionType.Hammer, position: hitPosition }, affectedTiles };
    }

    handleHammerUsed(room: RoomGame, usagePosition: Vec2): Player[] {
        const hammerResult: Player[] = [];
        const playerUsed = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const playerAffected = findPlayerAtPosition(usagePosition, room);
        hammerResult.push(playerAffected);
        const affectedTiles = this.determineHammerAffectedTiles(playerUsed, usagePosition, room).affectedTiles;
        const lastHit = affectedTiles[affectedTiles.length - 1];
        const hitPlayer = findPlayerAtPosition(lastHit, room);
        if (hitPlayer) {
            hammerResult.push(hitPlayer);
        }
        const playerDeathPosition = affectedTiles.length === 1 ? usagePosition : affectedTiles[affectedTiles.length - 2];
        playerAffected.playerInGame.currentPosition = { x: playerDeathPosition.x, y: playerDeathPosition.y };
        return hammerResult;
    }

    private hammerSlide(room: RoomGame, hitPosition: Vec2, directionVec: Vec2) {
        let isObstacleHit = false;
        const currentTile: Vec2 = { x: hitPosition.x, y: hitPosition.y };
        const affectedTiles: Vec2[] = [];
        while (!isObstacleHit) {
            currentTile.x += directionVec.x;
            currentTile.y += directionVec.y;

            if ([TileTerrain.Wall, TileTerrain.ClosedDoor].includes(room.game.map.mapArray[currentTile.y][currentTile.x])) {
                break;
            }

            affectedTiles.push({ x: currentTile.x, y: currentTile.y });

            if (isTileUnavailable(currentTile, room.game.map.mapArray, room.players) || this.isTileAtEdgeOfMap(room.game.map, currentTile)) {
                isObstacleHit = true;
            }
        }
        return affectedTiles;
    }

    private isTileAtEdgeOfMap(map: Map, tile: Vec2): boolean {
        return tile.x % (map.size - 1) === 0 || tile.y % (map.size - 1) === 0;
    }

    private arePositionsEqual(pos1: Vec2, pos2: Vec2): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
}
