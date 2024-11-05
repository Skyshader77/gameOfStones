import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/common/utilities';
import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { TILE_COSTS } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PathfindingService {
    dijkstraReachableTiles(players: Player[], game: Game): ReachableTile[] {
        const currentPlayer = players.find((player: Player) => player.playerInfo.userName === game.currentPlayer);
        const visited = new Set<string>();
        const priorityQueue: { pos: Vec2; remainingSpeed: number; path: Direction[] }[] = [];

        priorityQueue.push({
            pos: currentPlayer.playerInGame.currentPosition,
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
            path: [],
        });

        const reachableTiles: ReachableTile[] = [];

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => b.remainingSpeed - a.remainingSpeed);

            const item = priorityQueue.shift();

            if (!item) continue;

            const { pos, remainingSpeed, path } = item;
            const key = `${pos.x},${pos.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            reachableTiles.push({
                position: pos,
                remainingMovement: remainingSpeed,
                path,
            });

            for (const direction of Object.keys(directionToVec2Map)) {
                const delta = directionToVec2Map[direction as Direction];
                const newX = pos.x + delta.x;
                const newY = pos.y + delta.y;

                if (isCoordinateWithinBoundaries({ x: newX, y: newY }, game.map.mapArray)) {
                    const neighborTile = game.map.mapArray[newY][newX];
                    const moveCost = TILE_COSTS[neighborTile];

                    if (moveCost !== Infinity && remainingSpeed - moveCost >= 0 && !isAnotherPlayerPresentOnTile({ x: newX, y: newY }, players)) {
                        const newRemainingSpeed = remainingSpeed - moveCost;
                        const newPath = [...path, direction as Direction];

                        priorityQueue.push({
                            pos: { x: newX, y: newY },
                            remainingSpeed: newRemainingSpeed,
                            path: newPath,
                        });
                    }
                }
            }
        }

        return reachableTiles;
    }

    getOptimalPath(reachableTiles: ReachableTile[], destination: Vec2): ReachableTile {
        const targetTile = reachableTiles.find((tile) => tile.position.x === destination.x && tile.position.y === destination.y);
        if (!targetTile) {
            return null;
        }
        return targetTile;
    }
}
