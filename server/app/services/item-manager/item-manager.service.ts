import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item, ItemLostHandler } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class ItemManagerService {
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private gameStatsService: GameStatsService;
    @Inject() private pathFindingService: PathFindingService;
    hasToDropItem(player: Player) {
        return player.playerInGame.inventory.length > MAX_INVENTORY_SIZE;
    }

    placeRandomItems(room: RoomGame) {
        const placedItemTypes: ItemType[] = room.game.map.placedItems.map((item) => item.type);
        const availableItemTypes = this.getListOfAvailableItems(placedItemTypes);
        let index = 0;
        room.game.map.placedItems.forEach((item: Item) => {
            if (item.type === ItemType.Random) {
                item.type = availableItemTypes[index] as ItemType;
                index++;
            }
        });
    }

    handleInventoryLoss(room: RoomGame, player: Player) {
        player.playerInGame.inventory.forEach((item) => {
            this.handleItemLost({
                room,
                playerName: player.playerInfo.userName,
                itemDropPosition: player.playerInGame.currentPosition,
                itemType: item,
            });
        });
    }

    handleItemLost(itemLostHandler: ItemLostHandler) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(itemLostHandler.room.room.roomCode, itemLostHandler.playerName);
        const item = this.loseItem(itemLostHandler.room, player, itemLostHandler.itemType, itemLostHandler.itemDropPosition);
        server
            .to(itemLostHandler.room.room.roomCode)
            .emit(GameEvents.ItemDropped, { playerName: itemLostHandler.playerName, newInventory: player.playerInGame.inventory, item });
    }

    handleItemDrop(room: RoomGame, playerName: string, itemType: ItemType) {
        console.log('drop: ', itemType);
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const item = this.dropItem(room, player, itemType);
        server.to(room.room.roomCode).emit(GameEvents.ItemDropped, { playerName, newInventory: player.playerInGame.inventory, item });
        room.game.map.placedItems.forEach((yo) => {
            console.log('on map: ' + yo.type);
        });
    }

    handleItemPickup(room: RoomGame, player: Player) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const playerTileItem = this.getPlayerTileItem(room, player);
        if (!this.isItemGrabbable(playerTileItem.type) || !playerTileItem) return;
        const isInventoryFull: boolean = this.isInventoryFull(player);
        this.pickUpItem(room, player, playerTileItem.type);
        console.log('picked up: ' + playerTileItem.type);
        if (isInventoryFull) {
            this.handleFullInventory(room, player);
        }

        server.to(room.room.roomCode).emit(GameEvents.ItemPickedUp, { newInventory: player.playerInGame.inventory, itemType: playerTileItem.type });
    }

    private handleFullInventory(room: RoomGame, player: Player) {
        if (isPlayerHuman(player)) {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, player.playerInfo.userName, Gateway.Game);
            room.game.hasPendingAction = true;
            socket.emit(GameEvents.InventoryFull);
        } else if (!isPlayerHuman(player)) {
            this.keepItemsInInventory(room, player, player.playerInfo.role === PlayerRole.AggressiveAI ? OFFENSIVE_ITEMS : DEFENSIVE_ITEMS);
        }
    }

    private getListOfAvailableItems(placedItemTypes: ItemType[]) {
        return Object.keys(ItemType)
            .filter((key) => !isNaN(Number(key)))
            .map((key) => Number(key) as ItemType)
            .filter(
                (type: ItemType) => type !== ItemType.Random && type !== ItemType.Start && type !== ItemType.Flag && !placedItemTypes.includes(type),
            );
    }

    private getPlayerTileItem(room: RoomGame, player: Player) {
        const currentPlayerPosition: Vec2 = player.playerInGame.currentPosition;
        const playerItem: Item = room.game.map.placedItems.find((item) => {
            return item.position.x === currentPlayerPosition.x && item.position.y === currentPlayerPosition.y;
        });

        return playerItem ? playerItem : null;
    }

    private keepItemsInInventory(room: RoomGame, player: Player, itemTypes: ItemType[]) {
        let hasDroppedItem = false;
        for (const item of player.playerInGame.inventory) {
            if (!itemTypes.includes(item)) {
                this.handleItemDrop(room, player.playerInfo.userName, item);
                hasDroppedItem = true;
                break;
            }
        }
        if (!hasDroppedItem) {
            this.handleItemDrop(room, player.playerInfo.userName, player.playerInGame.inventory[0]);
        }
    }

    private isInventoryFull(player: Player) {
        return player.playerInGame.inventory.length === MAX_INVENTORY_SIZE;
    }

    private pickUpItem(room: RoomGame, player: Player, itemType: ItemType) {
        player.playerInGame.inventory.push(itemType);
        room.game.map.placedItems = room.game.map.placedItems.filter((item) => item.type !== itemType);
        this.messagingGateway.sendItemPickupJournal(room, itemType);
        this.gameStatsService.processItemPickupStats(room.game.stats, player, itemType);
    }

    private setItemAtPosition(item: Item, map: Map, newItemPosition: Vec2) {
        item.position.x = newItemPosition.x;
        item.position.y = newItemPosition.y;

        map.placedItems.push(item);
    }

    private removeItemFromInventory(itemType: ItemType, player: Player) {
        player.playerInGame.inventory = player.playerInGame.inventory.filter((inventoryItem) => inventoryItem !== itemType);
    }

    private isItemGrabbable(itemType: ItemType) {
        return itemType !== ItemType.Start;
    }

    private isItemInInventory(player: Player, itemType: ItemType): boolean {
        const doesItemExist = player.playerInGame.inventory.some((itemName) => itemName === itemType);
        return doesItemExist;
    }

    private dropItem(room: RoomGame, player: Player, itemType: ItemType): Item {
        if (!this.isItemInInventory(player, itemType)) return;
        const item = { type: itemType, position: { x: 0, y: 0 } };
        this.setItemAtPosition(item, room.game.map, player.playerInGame.currentPosition);
        this.removeItemFromInventory(item.type, player);
        return item;
    }

    private loseItem(room: RoomGame, player: Player, itemType: ItemType, itemDropPosition: Vec2): Item {
        if (!this.isItemInInventory(player, itemType)) return;
        const newItemPosition = this.pathFindingService.findNearestValidPosition({
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
