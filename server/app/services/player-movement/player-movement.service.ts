import { TEN_PERCENT_CHANGE } from '@app/constants/map-constants';
import { Player, Vec2 } from '@app/interfaces/playerPosition';
import { TileTerrain } from '@app/interfaces/tileTerrain';
import { GameMap } from '@app/model/database/map';
import { Injectable } from '@nestjs/common';
import { DijstraService } from '../disjtra/dijstra.service';
@Injectable()
export class PlayerMovementService {
    gameMap: GameMap;
    currentPlayer: Player;

    constructor(
        private dijstraService: DijstraService,
    ){}

    setGameMap(updatedGameMap: GameMap, turnPlayer: Player) {
        this.gameMap = updatedGameMap;
        this.currentPlayer = turnPlayer;
    }

    calculateShortestPath(destination: Vec2){
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
        return Math.random() < TEN_PERCENT_CHANGE;
    }

    updatePlayerPosition(node: Vec2, playerId: number) {
        const index = this.gameMap.players.findIndex((player: Player) => player.id === playerId);
        if (index !== -1) {
            this.gameMap.players[index].currentPosition = node;
        }
    }
}
