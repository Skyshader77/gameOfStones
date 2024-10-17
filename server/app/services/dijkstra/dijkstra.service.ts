import { IMPASSABLE_COST, TERRAIN_TO_COST_MAP } from '@app/constants/map.constants';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/roomGame';
import { Tile } from '@app/interfaces/tile';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { PriorityQueue } from '@app/services/priorityQueue/priorityQueue';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DijsktraService {
    room: RoomGame;
    currentPlayer: Player;

    findShortestPath(destination: Vec2, room: RoomGame, currentPlayer: Player): Vec2[] {
        this.room = room;
        this.currentPlayer = currentPlayer;
        const map = this.room.game.map.mapArray;
        const terrainCosts = TERRAIN_TO_COST_MAP;
        const priorityQueue = new PriorityQueue<Vec2>();
        const distances: number[][] = [];
        const previous: (Vec2 | null)[][] = [];

        if (!this.isValidDestination(destination, map)) {
            return [];
        }

        for (let x = 0; x < map.length; x++) {
            distances[x] = [];
            previous[x] = [];
            for (let y = 0; y < map[0].length; y++) {
                distances[x][y] = Infinity;
                previous[x][y] = null;
            }
        }

        distances[currentPlayer.playerInGame.currentPosition.x][currentPlayer.playerInGame.currentPosition.y] = 0;
        priorityQueue.enqueue(currentPlayer.playerInGame.currentPosition, 0);

        while (!priorityQueue.isEmpty()) {
            const currentNode = priorityQueue.dequeue();
            if (!currentNode) {
                break;
            }
            let newDistance = 0;
            if (currentNode.x === destination.x && currentNode.y === destination.y) {
                if (distances[currentNode.x][currentNode.y] > this.currentPlayer.playerInGame.movementSpeed) {
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

                newDistance = distances[currentNode.x][currentNode.y] + movementCost;
                if (newDistance < distances[neighbor.x][neighbor.y]) {
                    distances[neighbor.x][neighbor.y] = newDistance;
                    previous[neighbor.x][neighbor.y] = currentNode;
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

    reconstructPath(previous: (Vec2 | null)[][], destination: Vec2): Vec2[] {
        const path: Vec2[] = [];
        let currentNode: Vec2 | null = destination;

        while (currentNode) {
            path.push({ x: currentNode.x, y: currentNode.y });
            currentNode = previous[currentNode.x][currentNode.y];
        }

        return path.reverse();
    }

    isAnotherPlayerPresentOnTile(node: Vec2): boolean {
        return this.room.players.some(
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
        if (map[destination.x] && map[destination.x][destination.y] && map[destination.x][destination.y].terrain !== undefined) {
            destinationTerrain = map[destination.x][destination.y].terrain;
        }
        return (
            !this.isAnotherPlayerPresentOnTile(destination) &&
            !this.isClosedDoorOrWall(destinationTerrain) &&
            this.isCoordinateWithinBoundaries(destination, map)
        );
    }
}
