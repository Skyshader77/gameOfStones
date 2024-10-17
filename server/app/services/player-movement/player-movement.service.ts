import { SLIP_PROBABILITY } from '@app/constants/player.movement.test.constants';
import { Game, MovementServiceOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { DijsktraService } from '@app/services/dijkstra/dijkstra.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlayerMovementService {
    game: Game;
    currentPlayer: Player;
    hasTripped: boolean = false;

    constructor(private dijstraService: DijsktraService) {}

    setGameMap(game: Game, turnPlayer: Player) {
        this.game = game;
        this.currentPlayer = turnPlayer;
    }

    calculateShortestPath(destination: Vec2) {
        return this.dijstraService.findShortestPath(destination, this.game, this.currentPlayer);
    }

    processPlayerMovement(destination: Vec2): MovementServiceOutput {
        const desiredPath = this.calculateShortestPath(destination);
        return this.executeShortestPath(desiredPath);
    }

    executeShortestPath(desiredPath: Vec2[]): MovementServiceOutput {
        this.hasTripped = false;
        const actualPath: Vec2[] = [];
        for (const node of desiredPath) {
            actualPath.push(node);
            if (this.isPlayerOnIce(node) && this.hasPlayerTrippedOnIce()) {
                this.hasTripped = true;
                break;
            }
        }
        return { displacementVector: actualPath, hasTripped: this.hasTripped };
    }

    isPlayerOnIce(node: Vec2): boolean {
        return this.game.map.mapArray[node.x][node.y].terrain === TileTerrain.ICE;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() < SLIP_PROBABILITY;
    }

    updatePlayerPosition(node: Vec2, playerId: string) {
        const index = this.game.players.findIndex((player: Player) => player.id === playerId);
        if (index !== -1) {
            this.game.players[index].playerInGame.currentPosition = node;
        }
    }
}
