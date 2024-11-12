import { getAdjacentPositions, isCoordinateWithinBoundaries } from '@app/common/utilities';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ItemManagerService {
    constructor(private roomManagerService: RoomManagerService) { }

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

    scatterItems(player: Player, map: Map) {
        let newItemOnMap: Item;
        if (player.playerInGame.inventory.length === 0) {
            return;
        }
        for (const itemType of player.playerInGame.inventory) {
            const newItemPosition = this.findNearestValidDropPosition(map, player.playerInGame.currentPosition);
            newItemOnMap = new Item();
            newItemOnMap.type = itemType;
            this.setItemAtPosition(newItemOnMap, map, newItemPosition);
        }
        player.playerInGame.inventory = [];
    }

    removeItemFromInventory(itemType: ItemType, player: Player) {
        player.playerInGame.inventory = player.playerInGame.inventory.filter((inventoryItem) => inventoryItem !== itemType);
    }

    isItemGrabbable(itemType: ItemType) {
        return ![ItemType.None, ItemType.Start].includes(itemType);
    }

    isItemInInventory(player: Player, itemType: ItemType): boolean {
        const doesItemExist = player.playerInGame.inventory.some((itemName) => itemName === itemType);
        return doesItemExist;
    }

    findNearestValidDropPosition(map: Map, playerPosition: Vec2): Vec2 | null {
        const queue: Vec2[] = [playerPosition];
        const visited: Set<string> = new Set();

        while (queue.length > 0) {
            const currentPosition = queue.shift();
            const positionKey = `${currentPosition.x},${currentPosition.y}`;

            if (visited.has(positionKey)) {
                continue;
            }

            visited.add(positionKey);

            if (
                isCoordinateWithinBoundaries(currentPosition, map.mapArray) &&
                this.isValidTerrainForItem(currentPosition, map.mapArray) &&
                !this.isItemOnTile(currentPosition, map)
            ) {
                return currentPosition;
            }

            const adjacentPositions = getAdjacentPositions(currentPosition);
            adjacentPositions.forEach((position: Vec2) => queue.push(position));
        }

        return null;
    }

    isValidTerrainForItem(position: Vec2, mapArray: TileTerrain[][]) {
        return [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water].includes(mapArray[position.y][position.x]);
    }

    isItemOnTile(position: Vec2, map: Map) {
        const foundItem = map.placedItems.find((item) => {
            return item.position.x === position.x && item.position.y === position.y;
        });
        if (foundItem) {
            return true;
        } else {
            return false;
        }
    }
}
