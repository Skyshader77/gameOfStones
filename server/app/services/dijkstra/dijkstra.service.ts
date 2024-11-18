import { Game } from '@app/interfaces/gameplay';
import { ReachableTilesData } from '@app/interfaces/reachable-tiles-data';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { TILE_COSTS } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PathfindingService {
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
        const { game, players, priorityQueue, avoidPlayers } = reachableTilesData;

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
                const newX = position.x + delta.x;
                const newY = position.y + delta.y;

                if (isCoordinateWithinBoundaries({ x: newX, y: newY }, game.map.mapArray)) {
                    const neighborTile = game.map.mapArray[newY][newX];
                    const moveCost = TILE_COSTS[neighborTile];

                    if (
                        moveCost !== Infinity &&
                        remainingMovement - moveCost >= 0 &&
                        (!avoidPlayers || !isAnotherPlayerPresentOnTile({ x: newX, y: newY }, players))
                    ) {
                        const newRemainingSpeed = remainingMovement - moveCost;
                        const newPath = [...path, direction as Direction];

                        priorityQueue.push({
                            position: { x: newX, y: newY },
                            remainingMovement: newRemainingSpeed,
                            path: newPath,
                        });
                    }
                }
            }
        }
        return reachableTiles;
    }
}
