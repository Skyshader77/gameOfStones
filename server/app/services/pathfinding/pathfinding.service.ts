import { Game } from '@app/interfaces/gameplay';
import { ReachableTilesData } from '@app/interfaces/reachable-tiles-data';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { TILE_COSTS } from '@common/constants/tile.constants';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
@Injectable()
export class PathFindingService {
    constructor(private conditionalItemService: ConditionalItemService) {}
    dijkstraReachableTiles(players: Player[], game: Game): ReachableTile[] {
        const currentPlayer = players.find((player: Player) => player.playerInfo.userName === game.currentPlayer);
        const priorityQueue: ReachableTile[] = [];

        priorityQueue.push({
            position: currentPlayer.playerInGame.currentPosition,
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
            path: [],
        });

        return this.computeReachableTiles({ game, currentPlayer, players, priorityQueue, avoidPlayers: true });
    }

    getOptimalPath(reachableTiles: ReachableTile[], destination: Vec2): ReachableTile | null {
        const targetTile = reachableTiles.find((tile) => tile.position.x === destination.x && tile.position.y === destination.y);
        if (!targetTile) {
            return null;
        }
        return targetTile;
    }

    private computeReachableTiles(reachableTilesData: ReachableTilesData) {
        const reachableTiles: ReachableTile[] = [];
        const visited = new Set<string>();

        while (reachableTilesData.priorityQueue.length > 0) {
            reachableTilesData.priorityQueue.sort((a, b) => b.remainingMovement - a.remainingMovement);

            const currentTile = reachableTilesData.priorityQueue.shift();

            const key = `${currentTile.position.x},${currentTile.position.y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            reachableTiles.push(currentTile);
            this.processReachableNeighbors(currentTile, reachableTilesData);
        }
        return reachableTiles;
    }

    private processReachableNeighbors(currentTile: ReachableTile, reachableTilesData: ReachableTilesData) {
        for (const direction of Object.keys(directionToVec2Map)) {
            this.processTileNeighbor(direction as Direction, currentTile, reachableTilesData);
        }
    }

    private processTileNeighbor(direction: Direction, currentTile: ReachableTile, reachableTilesData: ReachableTilesData) {
        const delta = directionToVec2Map[direction as Direction];
        const newPosition: Vec2 = { x: currentTile.position.x + delta.x, y: currentTile.position.y + delta.y };

        if (isCoordinateWithinBoundaries(newPosition, reachableTilesData.game.map.mapArray)) {
            const neighborTile = reachableTilesData.game.map.mapArray[newPosition.y][newPosition.x];
            const newRemainingMovement = this.getNewRemainingMovement(currentTile.remainingMovement, neighborTile, reachableTilesData);
            if (this.isTileWalkable(newRemainingMovement, newPosition, reachableTilesData)) {
                const newPath = [...currentTile.path, { direction, remainingMovement: newRemainingMovement }];

                reachableTilesData.priorityQueue.push({
                    position: newPosition,
                    remainingMovement: newRemainingMovement,
                    path: newPath,
                });
            }
        }
    }

    private getNewRemainingMovement(remainingMovement: number, neighborTile: TileTerrain, reachableTilesData: ReachableTilesData): number {
        const moveCost = this.conditionalItemService.areSapphireFinsApplied(reachableTilesData.currentPlayer, neighborTile)
            ? 0
            : TILE_COSTS[neighborTile];
        return remainingMovement - moveCost;
    }

    private isTileWalkable(remainingMovement: number, newPosition: Vec2, reachableTilesData: ReachableTilesData): boolean {
        return remainingMovement >= 0 && (!reachableTilesData.avoidPlayers || !isAnotherPlayerPresentOnTile(newPosition, reachableTilesData.players));
    }
}
