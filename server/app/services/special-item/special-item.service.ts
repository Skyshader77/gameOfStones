import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { Map } from '@common/interfaces/map';
import { ItemAction } from '@common/interfaces/overworld-action';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SpecialItemService {
    determineBombAffectedTiles(currentPlayer: Player) : ItemAction{
        return {overWorldAction: { action: OverWorldActionType.Bomb, position: currentPlayer.playerInGame.currentPosition }, affectedTiles: []}
        // TODO calculate tiles
    }

    determineHammerAffectedTiles(currentPlayer: Player, tile: Vec2, map: Map) : ItemAction{
        return {overWorldAction: { action: OverWorldActionType.Hammer, position: tile }, affectedTiles: []}
        // TODO calculate tiles
    }
}