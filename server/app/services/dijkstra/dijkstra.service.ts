import { IMPASSABLE_COST, TERRAIN_TO_COST_MAP } from '@app/constants/map.constants';
import { PlayerInGame } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Tile } from '@app/interfaces/tile';
import { TileTerrain } from '@app/interfaces/tile-terrain';
import { PriorityQueue } from '@app/services/priority-queue/priority-queue';
import { DijkstraServiceOutput } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DijkstraService {
    findShortestPath(destination: Vec2, room: RoomGame, currentPlayerName: string): DijkstraServiceOutput {
        // TODO USE A SERVICE FOR THIS
        const currentPlayer = room.players.find((player) => player.playerInfo.userName === currentPlayerName);
        const map = room.game.map.mapArray;
        const priorityQueue = new PriorityQueue<Vec2>();

        if (!this.isValidDestination(destination, room)) {
            return this.createNothingChangedOutput(currentPlayer.playerInGame);
        }

        const { distances, previous } = this.initializeDistanceAndPreviousArrays(map);

        distances[currentPlayer.playerInGame.currentPosition.x][currentPlayer.playerInGame.currentPosition.y] = 0;
        priorityQueue.enqueue(currentPlayer.playerInGame.currentPosition, 0);

        while (!priorityQueue.isEmpty()) {
            const currentNode = priorityQueue.dequeue();
            if (!currentNode) {
                break;
            }
            let newDistance = 0;
            if (currentNode.x === destination.x && currentNode.y === destination.y) {
                if (distances[currentNode.x][currentNode.y] > currentPlayer.playerInGame.remainingSpeed) {
                    return this.createNothingChangedOutput(currentPlayer.playerInGame);
                } else {
                    currentPlayer.playerInGame.remainingSpeed = currentPlayer.playerInGame.remainingSpeed - distances[currentNode.x][currentNode.y];
                    return {
                        position: destination,
                        displacementVector: this.reconstructPath(previous, destination),
                        remainingSpeed: currentPlayer.playerInGame.remainingSpeed,
                    };
                }
            }

            const neighbors = this.getNeighbors(currentNode, map);

            for (const neighbor of neighbors) {
                const terrain = map[neighbor.x][neighbor.y].terrain;
                const movementCost = TERRAIN_TO_COST_MAP[terrain];

                if (movementCost === IMPASSABLE_COST || this.isAnotherPlayerPresentOnTile(neighbor, room)) {
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
        return this.createNothingChangedOutput(currentPlayer.playerInGame);
    }

    isAnotherPlayerPresentOnTile(node: Vec2, room: RoomGame): boolean {
        return room.players.some((player) => player.playerInGame.currentPosition.x === node.x && player.playerInGame.currentPosition.y === node.y);
    }

    isCoordinateWithinBoundaries(destination: Vec2, map: Tile[][]): boolean {
        return !(destination.x >= map.length || destination.y >= map[0].length || destination.x < 0 || destination.y < 0);
    }

    isClosedDoorOrWall(destinationTerrain: TileTerrain) {
        return destinationTerrain === TileTerrain.CLOSEDDOOR || destinationTerrain === TileTerrain.WALL;
    }

    private reconstructPath(previous: (Vec2 | null)[][], destination: Vec2): Vec2[] {
        const path: Vec2[] = [];
        let currentNode: Vec2 | null = destination;

        while (currentNode) {
            path.push({ x: currentNode.x, y: currentNode.y });
            currentNode = previous[currentNode.x][currentNode.y];
        }

        return path.reverse();
    }

    private getNeighbors(node: Vec2, map: Tile[][]): Vec2[] {
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
            if (newX >= 0 && newX < map.length && newY >= 0 && newY < map.length) {
                neighbors.push({ x: newX, y: newY });
            }
        });
        return neighbors;
    }

    private isValidDestination(destination: Vec2, room: RoomGame): boolean {
        let destinationTerrain: TileTerrain;
        if (
            room.game.map.mapArray[destination.x] &&
            room.game.map.mapArray[destination.x][destination.y] &&
            room.game.map.mapArray[destination.x][destination.y].terrain !== undefined
        ) {
            destinationTerrain = room.game.map.mapArray[destination.x][destination.y].terrain;
        }
        return (
            !this.isAnotherPlayerPresentOnTile(destination, room) &&
            !this.isClosedDoorOrWall(destinationTerrain) &&
            this.isCoordinateWithinBoundaries(destination, room.game.map.mapArray)
        );
    }
    private initializeDistanceAndPreviousArrays(map: Tile[][]): {
        distances: number[][];
        previous: (Vec2 | null)[][];
    } {
        const distances: number[][] = [];
        const previous: (Vec2 | null)[][] = [];

        for (let x = 0; x < map.length; x++) {
            distances[x] = [];
            previous[x] = [];
            for (let y = 0; y < map[0].length; y++) {
                distances[x][y] = Infinity;
                previous[x][y] = null;
            }
        }

        return { distances, previous };
    }

    private createNothingChangedOutput(currentPlayer: PlayerInGame): DijkstraServiceOutput {
        return {
            position: currentPlayer.currentPosition,
            displacementVector: [],
            remainingSpeed: currentPlayer.remainingSpeed,
        };
    }
}
