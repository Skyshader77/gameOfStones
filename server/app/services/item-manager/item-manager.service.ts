import { findNearestValidPosition } from '@app/common/utilities';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ItemManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    getPlayerTileItem(room: RoomGame, player: Player) {
        const currentPlayerPosition: Vec2 = player.playerInGame.currentPosition;
        const playerItem: Item = room.game.map.placedItems.find((item) => {
            return item.position.x === currentPlayerPosition.x && item.position.y === currentPlayerPosition.y;
        });

        return playerItem ? playerItem : null;
    }

    isInventoryFull(player: Player) {
        return player.playerInGame.inventory.length === MAX_INVENTORY_SIZE;
    }

    pickUpItem(room: RoomGame, player: Player, itemType: ItemType) {
        player.playerInGame.inventory.push(itemType);
        room.game.map.placedItems = room.game.map.placedItems.filter((item) => item.type !== itemType);
    }

    setItemAtPosition(item: Item, map: Map, newItemPosition: Vec2) {
        item.position.x = newItemPosition.x;
        item.position.y = newItemPosition.y;

        map.placedItems.push(item);
    }

    removeItemFromInventory(itemType: ItemType, player: Player) {
        player.playerInGame.inventory = player.playerInGame.inventory.filter((inventoryItem) => inventoryItem !== itemType);
    }

    isItemGrabbable(itemType: ItemType) {
        return itemType !== ItemType.Start;
    }

    isItemInInventory(player: Player, itemType: ItemType): boolean {
        const doesItemExist = player.playerInGame.inventory.some((itemName) => itemName === itemType);
        return doesItemExist;
    }

    hasToDropItem(player: Player) {
        return player.playerInGame.inventory.length > MAX_INVENTORY_SIZE;
    }

    dropRandomItem(room: RoomGame, player: Player): Item {
        if (!this.hasToDropItem(player)) return;
        const randomItemType = player.playerInGame.inventory[Math.floor(Math.random() * player.playerInGame.inventory.length)];
        const item = this.dropItem(room, player, randomItemType);
        return item;
    }

    dropItem(room: RoomGame, player: Player, itemType: ItemType): Item {
        if (!this.isItemInInventory(player, itemType)) return;
        const item = { type: itemType, position: { x: 0, y: 0 } };
        this.setItemAtPosition(item, room.game.map, player.playerInGame.currentPosition);
        this.removeItemFromInventory(item.type, player);
        return item;
    }

    loseItem(room: RoomGame, player: Player, itemType: ItemType, itemDropPosition: Vec2): Item {
        if (!this.isItemInInventory(player, itemType)) return;
        const newItemPosition = findNearestValidPosition({
            room,
            startPosition: itemDropPosition,
            checkForItems: true,
        });
        if (!newItemPosition) return;
        const item = { type: itemType, position: { x: newItemPosition.x, y: newItemPosition.y } };
        this.setItemAtPosition(item, room.game.map, newItemPosition);

        this.removeItemFromInventory(item.type, player);
        return item;
    }
}
