import { GLASS_STONE_STATS, GRANITE_SHIELD_STATS } from '@app/constants/item.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Player, PlayerAttributes } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleItemService {
    applySimpleItems(player: Player) {
        player.playerInGame.inventory.forEach((item) => {
            const effect = this.getItemStatChanges(item);

            player.playerInGame.attributes.hp += effect.hp;
            player.playerInGame.attributes.speed += effect.speed;
            player.playerInGame.attributes.attack += effect.attack;
            player.playerInGame.attributes.defense += effect.defense;
        });
    }

    private getItemStatChanges(item: ItemType): PlayerAttributes {
        switch (item) {
            case ItemType.Boost1:
                return GRANITE_SHIELD_STATS;
            case ItemType.Boost2:
                return GLASS_STONE_STATS;
            default:
                return {
                    hp: 0,
                    speed: 0,
                    attack: 0,
                    defense: 0,
                };
        }
    }
}
