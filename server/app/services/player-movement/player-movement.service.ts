import { IMPASSABLE_COST, TEN_PERCENT_CHANGE, TERRAIN_TO_COST_MAP } from '@app/constants/map-constants';
import { Player, Vec2 } from '@app/interfaces/playerPosition';
import { Tile } from '@app/interfaces/tile';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { GameMap } from '@app/model/database/map';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriorityQueue<T> {
    private items: { node: T; priority: number }[] = [];

    enqueue(node: T, priority: number) {
        this.items.push({ node, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }

    dequeue(): { node: T; priority: number } | undefined {
        return this.items.shift();
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

export class PlayerMovementService {
    gameMap: GameMap;
    currentPlayer: Player;

    setGameMap(updatedGameMap: GameMap, turnPlayer:Player) {
        this.gameMap = updatedGameMap;
        this.currentPlayer=turnPlayer;
    }

    findShortestPath(startingPosition: Vec2, destination: Vec2): Vec2[] {
        const map = this.gameMap.map.mapArray;
        const terrainCosts = TERRAIN_TO_COST_MAP;
        const priorityQueue = new PriorityQueue<Vec2>();
        const distances: { [key: string]: number } = {};
        const previous: { [key: string]: Vec2 | null } = {};

        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                distances[`${x},${y}`] = Infinity;
                previous[`${x},${y}`] = null;
            }
        }

        distances[`${startingPosition.x},${startingPosition.y}`] = 0;
        priorityQueue.enqueue(startingPosition, 0);

        while (!priorityQueue.isEmpty()) {
            const { node: currentNode } = priorityQueue.dequeue()!;
            let newDistance=0;
            if (currentNode.x === destination.x && currentNode.y === destination.y) {
                if (newDistance>this.currentPlayer.maxDisplacementValue){
                    return [];
                } else{
                    return this.reconstructPath(previous, destination);
                }
            }

            const neighbors = this.getNeighbors(currentNode, map);

            for (const neighbor of neighbors) {
                const terrain = map[neighbor.x][neighbor.y].terrain;
                const movementCost = terrainCosts[terrain];

                if (movementCost === IMPASSABLE_COST) {
                    continue;
                }

                newDistance = distances[`${currentNode.x},${currentNode.y}`] + movementCost;
                if (newDistance < distances[`${neighbor.x},${neighbor.y}`]) {
                    distances[`${neighbor.x},${neighbor.y}`] = newDistance;
                    previous[`${neighbor.x},${neighbor.y}`] = currentNode;
                    priorityQueue.enqueue(neighbor, newDistance);
                }
            }
        }

        return [];
    }

    executeShortestPath(desiredPath: Vec2[]): Vec2[] {
        let actualPath: Vec2[];
        for (const node of desiredPath) {
            actualPath.push(node);
            if (this.isPlayerOnIce(node) && this.hasPlayerTrippedOnIce()) {
                break;
            }
        }
        return actualPath;
    }

    isPlayerOnIce(node: Vec2): boolean {
        return this.gameMap.map.mapArray[node.x][node.y].terrain === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < TEN_PERCENT_CHANGE;
    }

    updatePlayerPosition(node: Vec2, playerId: number) {
        const index = this.gameMap.players.findIndex((player: Player) => player.id === playerId);
        if (index!==-1){
            this.gameMap.players[index].currentPosition = node;
        }
    }

    getNeighbors(node: Vec2, map: Tile[][]): Vec2[] {
        const neighbors: Vec2[] = [];
        const { x, y } = node;

        if (x > 0) neighbors.push({ x: x - 1, y });
        if (x < map.length - 1) neighbors.push({ x: x + 1, y });
        if (y > 0) neighbors.push({ x, y: y - 1 });
        if (y < map[0].length - 1) neighbors.push({ x, y: y + 1 });

        return neighbors;
    }

    reconstructPath(previous: { [key: string]: Vec2 | null }, destination: Vec2): Vec2[] {
        const path: Vec2[] = [];
        let currentNode: Vec2 | null = destination;

        while (currentNode) {
            path.push({ x: currentNode.x, y: currentNode.y });
            currentNode = previous[`${currentNode.x},${currentNode.y}`];
        }

        return path.reverse();
    }
}
