import { Game } from '@app/interfaces/gameplay';
import { ReachableTilesData } from '@app/interfaces/reachable-tiles-data';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { TILE_COSTS } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
@Injectable()
export class PathfindingService {
    constructor(private conditionalItemService: ConditionalItemService) { }
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
        const { game, currentPlayer, players, priorityQueue, avoidPlayers } = reachableTilesData;

        const reachableTiles: ReachableTile[] = [];
        const visited = new Set<string>();

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => b.remainingMovement - a.remainingMovement);

            const item = priorityQueue.shift();

            const { position, remainingMovement, path } = item;
            const key = `${position.x},${position.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            reachableTiles.push({
                position,
                remainingMovement,
                path,
            });

            for (const direction of Object.keys(directionToVec2Map)) {
                const delta = directionToVec2Map[direction as Direction];
                const newPosition: Vec2 = { x: position.x + delta.x, y: position.y + delta.y };

                if (isCoordinateWithinBoundaries(newPosition, game.map.mapArray)) {
                    const neighborTile = game.map.mapArray[newPosition.y][newPosition.x];
                    const moveCost = this.conditionalItemService.areSapphireFinsApplied(currentPlayer, game.map, newPosition) ? 0 : TILE_COSTS[neighborTile];

                    if (
                        moveCost !== Infinity &&
                        remainingMovement - moveCost >= 0 &&
                        (!avoidPlayers || !isAnotherPlayerPresentOnTile(newPosition, players))
                    ) {
                        const newRemainingMovement = remainingMovement - moveCost;
                        const newPath = [...path, { direction: direction as Direction, remainingMovement: newRemainingMovement }];

                        priorityQueue.push({
                            position: newPosition,
                            remainingMovement: newRemainingMovement,
                            path: newPath,
                        });
                    }
                }
            }
        }
        return reachableTiles;
    }
}
