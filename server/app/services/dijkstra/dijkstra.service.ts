import { MAX_AI_DISPLACEMENT_VALUE } from '@app/constants/virtual-player.constants';
import { Game } from '@app/interfaces/gameplay';
import { ReachableTilesData } from '@app/interfaces/reachable-tiles-data';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries, isPlayerHuman } from '@app/utils/utilities';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TILE_COSTS, TILE_COSTS_AI } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PathfindingService {
    dijkstraReachableTiles(players: Player[], game: Game): ReachableTile[] {
        const currentPlayer = players.find((player: Player) => player.playerInfo.userName === game.currentPlayer);
        const priorityQueue: { pos: Vec2; remainingSpeed: number; path: Direction[] }[] = [];
        priorityQueue.push({
            pos: currentPlayer.playerInGame.currentPosition,
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
            path: [],
        });
        return this.computeReachableTiles({ game, players, priorityQueue, isVirtualPlayer: false, isSeekingPlayers: false });
    }

    dijkstraReachableTilesAi(players: Player[], game: Game, isSeekingPlayers: boolean): ReachableTile[] {
        const currentPlayer = players.find((player: Player) => player.playerInfo.userName === game.currentPlayer);
        const priorityQueue: { pos: Vec2; remainingSpeed: number; path: Direction[] }[] = [];
        priorityQueue.push({
            pos: currentPlayer.playerInGame.currentPosition,
            remainingSpeed: MAX_AI_DISPLACEMENT_VALUE,
            path: [],
        });
        return this.computeReachableTiles({ game, players, priorityQueue, isVirtualPlayer: true, isSeekingPlayers: isSeekingPlayers });
    }

    getOptimalPath(reachableTiles: ReachableTile[], destination: Vec2): ReachableTile | null {
        const targetTile = reachableTiles.find((tile) => tile.position.x === destination.x && tile.position.y === destination.y);
        if (!targetTile) {
            return null;
        }
        return targetTile;
    }

    private computeReachableTiles(reachableTilesData: ReachableTilesData) {
        const { game, players, priorityQueue, isVirtualPlayer, isSeekingPlayers } = reachableTilesData;

        const reachableTiles: ReachableTile[] = [];
        const visited = new Set<string>();

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => b.remainingSpeed - a.remainingSpeed);

            const item = priorityQueue.shift();

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
                    let moveCost: number;
                    if (!isVirtualPlayer) {
                        moveCost = TILE_COSTS[neighborTile];
                    } else {
                        moveCost = TILE_COSTS_AI[neighborTile];
                    }
                    if (
                        moveCost !== Infinity &&
                        remainingSpeed - moveCost >= 0 &&
                        (isSeekingPlayers || !isAnotherPlayerPresentOnTile({ x: newX, y: newY }, players))
                    ) {
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
}
