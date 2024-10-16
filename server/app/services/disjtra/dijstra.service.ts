import { IMPASSABLE_COST, TERRAIN_TO_COST_MAP } from '@app/constants/map-constants';
import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { Tile } from '@app/interfaces/tile';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriorityQueue<T> {
    private heap: { element: T; priority: number; order: number }[] = [];
    private orderCounter = 0;

    constructor(
        private comparator: (a: { priority: number; order: number }, b: { priority: number; order: number }) => number = (a, b) =>
            a.priority - b.priority || a.order - b.order,
    ) {}

    enqueue(element: T, priority: number): void {
        this.heap.push({ element, priority, order: this.orderCounter++ });
        this.percolateUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const root = this.heap[0].element;
        const last = this.heap.pop();
        if (last !== undefined && this.heap.length > 0) {
            this.heap[0] = last;
            this.percolateDown(0);
        }
        return root;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private percolateUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private percolateDown(index: number): void {
        const heapSize = this.heap.length;
        while (index < heapSize) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < heapSize && this.comparator(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }

            if (rightChild < heapSize && this.comparator(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}

export class DijstraService {
    gameMap: Game;
    currentPlayer: Player;

    findShortestPath(destination: Vec2, gameMap: Game, currentPlayer: Player): Vec2[] {
        this.gameMap = gameMap;
        this.currentPlayer = currentPlayer;
        const map = this.gameMap.map.mapArray;
        const terrainCosts = TERRAIN_TO_COST_MAP;
        const priorityQueue = new PriorityQueue<Vec2>();
        const distances: { [key: string]: number } = {};
        const previous: { [key: string]: Vec2 | null } = {};

        if (!this.isValidDestination(destination, map)) {
            return [];
        }

        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                distances[`${x},${y}`] = Infinity;
                previous[`${x},${y}`] = null;
            }
        }

        distances[`${currentPlayer.playerInGame.currentPosition.x},${currentPlayer.playerInGame.currentPosition.y}`] = 0;
        priorityQueue.enqueue(currentPlayer.playerInGame.currentPosition, 0);

        while (!priorityQueue.isEmpty()) {
            const currentNode = priorityQueue.dequeue();
            if (!currentNode) {
                break;
            }
            let newDistance = 0;
            if (currentNode.x === destination.x && currentNode.y === destination.y) {
                if (distances[`${currentNode.x},${currentNode.y}`] > this.currentPlayer.playerInGame.movementSpeed) {
                    return [];
                } else {
                    return this.reconstructPath(previous, destination);
                }
            }

            const neighbors = this.getNeighbors(currentNode, map);

            for (const neighbor of neighbors) {
                const terrain = map[neighbor.x][neighbor.y].terrain;
                const movementCost = terrainCosts[terrain];

                if (movementCost === IMPASSABLE_COST || this.isAnotherPlayerPresentOnTile(neighbor)) {
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

    getNeighbors(node: Vec2, map: Tile[][]): Vec2[] {
        const neighbors: Vec2[] = [];
        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
        ];

        directions.forEach((dir) => {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            if (newX >= 0 && newX < map.length && newY >= 0 && newY < map[0].length) {
                neighbors.push({ x: newX, y: newY });
            }
        });
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

    isAnotherPlayerPresentOnTile(node: Vec2): boolean {
        return this.gameMap.players.some(
            (player) =>
                player.id !== this.currentPlayer.id &&
                player.playerInGame.currentPosition.x === node.x &&
                player.playerInGame.currentPosition.y === node.y,
        );
    }

    isCoordinateWithinBoundaries(destination: Vec2, map: Tile[][]): boolean {
        return !(destination.x >= map.length || destination.y >= map[0].length || destination.x < 0 || destination.y < 0);
    }

    isClosedDoorOrWall(destinationTerrain: TileTerrain) {
        return destinationTerrain === TileTerrain.CLOSEDDOOR || destinationTerrain === TileTerrain.WALL;
    }

    private isValidDestination(destination: Vec2, map: Tile[][]): boolean {
        let destinationTerrain: TileTerrain;
        try {
            destinationTerrain = map[destination.x][destination.y].terrain;
        } catch {
            destinationTerrain = undefined;
        }
        return (
            !this.isAnotherPlayerPresentOnTile(destination) &&
            !this.isClosedDoorOrWall(destinationTerrain) &&
            this.isCoordinateWithinBoundaries(destination, map)
        );
    }
}
