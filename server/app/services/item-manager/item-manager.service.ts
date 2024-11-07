import { getNearestPositions, isCoordinateWithinBoundaries } from '@app/common/utilities';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '../room-manager/room-manager.service';
@Injectable()
export class ItemManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    getPlayerTileItem(room: RoomGame, player: Player) {
        const currentPlayerPosition: Vec2 = player.playerInGame.currentPosition;
        const playerItem: Item = room.game.map.placedItems.find((item) => {
            item.position === currentPlayerPosition;
        });

        return playerItem ? playerItem : null;
    }

    isInventoryFull(player: Player) {
        return player.playerInGame.inventory.length === MAX_INVENTORY_SIZE;
    }

    pickUpItem(room: RoomGame, player: Player, tileItem: Item) {
        player.playerInGame.inventory.push(tileItem);
        room.game.map.placedItems = room.game.map.placedItems.filter((item) => item.position !== tileItem.position);
    }

    setItemAtPosition(item: Item, map: Map, newItemPosition: Vec2) {
        item.position.x = newItemPosition.x;
        item.position.y = newItemPosition.y;

        map.placedItems.push(item);
    }

    removeItemFromInventory(item: Item, player: Player) {
        player.playerInGame.inventory = player.playerInGame.inventory.filter((inventoryItem) => inventoryItem.type !== item.type);
    }

    isItemGrabbable(itemType: ItemType) {
        return ![ItemType.None, ItemType.Start].includes(itemType);
    }

    isItemInInventory(player: Player, itemType: ItemType): boolean {
        const doesItemExist = player.playerInGame.inventory.some((item) => item.type === itemType);
        return doesItemExist;
    }

    findNearestTileAvailableForDrop(map: Map, playerPosition: Vec2) {
        const adjacentPositions = getNearestPositions(playerPosition, map.size);

        for (const position of adjacentPositions) {
            if (isCoordinateWithinBoundaries(position, map.mapArray) && this.isValidTerrainForItem(position, map.mapArray)) {
                return position;
            }
        }
    }

    isValidTerrainForItem(position: Vec2, mapArray: TileTerrain[][]) {
        return [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water].includes(mapArray[position.y][position.x]);
    }
}
