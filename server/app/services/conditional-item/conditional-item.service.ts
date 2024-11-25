import { QUARTZ_SKATE_STATS } from '@app/constants/item.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConditionalItemService {
    applyQuartzSkates(player: Player, map: Map) {
        if (this.areQuartzSkatesApplied(player, map)) {
            player.playerInGame.attributes.attack += QUARTZ_SKATE_STATS.attack;
            player.playerInGame.attributes.defense += QUARTZ_SKATE_STATS.defense;
        }
    }

    areSapphireFinsApplied(player: Player, map: Map, newPosition: Vec2): boolean {
        return player.playerInGame.inventory.includes(ItemType.SapphireFins) && map.mapArray[newPosition.y][newPosition.x] === TileTerrain.Water;
    }

    private areQuartzSkatesApplied(player: Player, map: Map): boolean {
        return (
            player.playerInGame.inventory.includes(ItemType.QuartzSkates) &&
            map.mapArray[player.playerInGame.currentPosition.y][player.playerInGame.currentPosition.x] === TileTerrain.Ice
        );
    }
}
