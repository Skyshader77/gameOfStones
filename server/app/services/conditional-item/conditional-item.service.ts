import { QUARTZ_SKATE_STATS } from '@app/constants/item.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConditionalItemService {
    applyQuartzSkates(player: Player, map: Map) {
        if (this.areQuartzSkatesApplied(player, map)) {
            player.playerInGame.attributes.attack += QUARTZ_SKATE_STATS.attack;
            player.playerInGame.attributes.defense += QUARTZ_SKATE_STATS.defense;
        }
    }

    areSapphireFinsApplied(player: Player, map: Map): boolean {
        return (
            player.playerInGame.inventory.includes(ItemType.Boost4) &&
            map.mapArray[player.playerInGame.currentPosition.y][player.playerInGame.currentPosition.x] === TileTerrain.Water
        );
    }

    private areQuartzSkatesApplied(player: Player, map: Map): boolean {
        return (
            player.playerInGame.inventory.includes(ItemType.Boost3) &&
            map.mapArray[player.playerInGame.currentPosition.y][player.playerInGame.currentPosition.x] === TileTerrain.Ice
        );
    }
}
