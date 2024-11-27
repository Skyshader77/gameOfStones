import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { ItemAction } from '@common/interfaces/overworld-action';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SpecialItemService {
    determineBombAffectedTiles(currentPlayer: Player): ItemAction {
        return { overWorldAction: { action: OverWorldActionType.Bomb, position: currentPlayer.playerInGame.currentPosition }, affectedTiles: [] };
        // TODO calculate tiles
    }

    determineHammerAffectedTiles(currentPlayer: Player, tile: Vec2, map: Map): ItemAction {
        const currentPlayerPosition: Vec2 = { x: currentPlayer.playerInGame.currentPosition.x, y: currentPlayer.playerInGame.currentPosition.y };
        const hitPlayer: Vec2 = { x: tile.x, y: tile.y };

        const directionVec = { x: hitPlayer.x - currentPlayerPosition.x, y: hitPlayer.y - currentPlayerPosition.y };

        const mapArray = map.mapArray;
        const currentTile: Vec2 = { x: hitPlayer.x, y: hitPlayer.y };
        const affectedTiles: Vec2[] = [];
        let isFinished = false;

        while (!isFinished) {
            currentTile.x += directionVec.x;
            currentTile.y += directionVec.y;
            affectedTiles.push({ x: currentTile.x, y: currentTile.y });
            if (mapArray[currentTile.y][currentTile.x] === TileTerrain.Wall) {
                isFinished = true;
            } else if (mapArray[currentTile.y][currentTile.x] === TileTerrain.ClosedDoor) {
                isFinished = true;
            } else if (
                currentTile.x === 0 ||
                currentTile.y === 0 ||
                currentTile.x === mapArray[0].length - 1 ||
                currentTile.y === mapArray.length - 1
            ) {
                isFinished = true;
            }
        }
        console.log(affectedTiles);
        return { overWorldAction: { action: OverWorldActionType.Hammer, position: tile }, affectedTiles };
    }
}
