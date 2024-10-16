import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { DijsktraService } from '@app/services/dijkstra/dijkstra.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    gameMap: Game;
    currentPlayer: Player;

    constructor(private dijstraService: DijsktraService) {}

    setGameMap(updatedGameMap: Game, turnPlayer: Player) {
        this.gameMap = updatedGameMap;
        this.currentPlayer = turnPlayer;
    }

    calculateShortestPath(destination: Vec2) {
        return this.dijstraService.findShortestPath(destination, this.gameMap, this.currentPlayer);
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
        return Math.random() < SLIP_PROBABILITY;
    }

    updatePlayerPosition(node: Vec2, playerId: string) {
        const index = this.gameMap.players.findIndex((player: Player) => player.id === playerId);
        if (index !== -1) {
            this.gameMap.players[index].playerInGame.currentPosition = node;
        }
    }
}
