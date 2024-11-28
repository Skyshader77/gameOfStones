import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item, ItemLostHandler } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { findPlayerAtPosition, isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { BombResult, ItemUsedPayload } from '@common/interfaces/item';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
import { SpecialItemService } from '../special-item/special-item.service';
import { TurnInfoService } from '../turn-info/turn-info.service';
@Injectable()
export class ItemManagerService {
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private gameStatsService: GameStatsService;
    @Inject() private pathFindingService: PathFindingService;
    @Inject() private specialItemService: SpecialItemService;
    @Inject() private turnInfoService: TurnInfoService;

    hasToDropItem(player: Player) {
        return player.playerInGame.inventory.length > MAX_INVENTORY_SIZE;
    }

    placeRandomItems(room: RoomGame) {
        const placedItemTypes: ItemType[] = room.game.map.placedItems.map((item) => item.type);
        const availableItemTypes = this.getListOfAvailablesItems(placedItemTypes);
        let availableItemsIndex = 0;
        room.game.map.placedItems.forEach((item: Item) => {
            if (item.type === ItemType.Random) {
                item.type = availableItemTypes[availableItemsIndex] as ItemType;
                availableItemsIndex++;
            }
        });
    }

    handleItemUsed(room: RoomGame, playerName: string, itemUsedPayload: ItemUsedPayload) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        switch (itemUsedPayload.type) {
            case ItemType.GeodeBomb:
                const bombResult: BombResult[] = this.handleBombUsed(room, itemUsedPayload.usagePosition);
                server.to(room.room.roomCode).emit(GameEvents.BombUsed, bombResult);
                this.turnInfoService.sendTurnInformation(room);
                break;
            case ItemType.GraniteHammer:
                this.handleHammerUsed(room, playerName, itemUsedPayload.usagePosition);
                break;
        }
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
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const item = this.dropItem(room, player, itemType);
        server.to(room.room.roomCode).emit(GameEvents.ItemDropped, { playerName, newInventory: player.playerInGame.inventory, item });
    }

    handleItemPickup(room: RoomGame, playerName: string) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const playerTileItem = this.getPlayerTileItem(room, player);
        const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, playerName, Gateway.Game);
        if (!this.isItemGrabbable(playerTileItem.type) || !playerTileItem) return;
        const isInventoryFull: boolean = this.isInventoryFull(player);
        if (isInventoryFull && isPlayerHuman(player)) {
            room.game.hasPendingAction = true;
            socket.emit(GameEvents.InventoryFull);
        } else if (isInventoryFull && !isPlayerHuman(player)) {
            if (player.playerInfo.role === PlayerRole.AggressiveAI) {
                this.keepItemsInInventory(room, player, OFFENSIVE_ITEMS);
            } else {
                this.keepItemsInInventory(room, player, DEFENSIVE_ITEMS);
            }
        }
        this.pickUpItem(room, player, playerTileItem.type);

        server.to(room.room.roomCode).emit(GameEvents.ItemPickedUp, { newInventory: player.playerInGame.inventory, itemType: playerTileItem.type });
    }

    remainingDefensiveItemCount(room: RoomGame) {
        return room.game.map.placedItems.filter((item) => DEFENSIVE_ITEMS.includes(item.type)).length;
    }

    handleInventoryLoss(player: Player, room: RoomGame, dropPosition: Vec2): void {
        player.playerInGame.inventory.forEach((item) => {
            this.handleItemLost({
                room,
                playerName: player.playerInfo.userName,
                itemDropPosition: dropPosition,
                itemType: item,
            });
        });
    }

    private handleBombUsed(room: RoomGame, usagePosition: Vec2): BombResult[] {
        const bombResult: BombResult[] = [];
        for (let x = 0; x < room.game.map.size; x++) {
            for (let y = 0; y < room.game.map.size; y++) {
                if (
                    (this.specialItemService.isTileInBombRange(usagePosition, { x, y }, room.game.map.size) &&
                        isAnotherPlayerPresentOnTile({ x, y }, room.players)) ||
                    (x === usagePosition.x && y === usagePosition.y)
                ) {
                    const player = findPlayerAtPosition({ x, y }, room);
                    const respawnPosition = {
                        x: player.playerInGame.startPosition.x,
                        y: player.playerInGame.startPosition.y,
                    };
                    this.handleInventoryLoss(player, room, { x, y });
                    player.playerInGame.currentPosition = {
                        x: respawnPosition.x,
                        y: respawnPosition.y,
                    };
                    const result: BombResult = { player, respawnPosition };
                    bombResult.push(result);
                }
            }
        }
        return bombResult;
    }

    private handleHammerUsed(room: RoomGame, playerName: string, usagePosition: Vec2) {
        // TODO
    }

    private getListOfAvailablesItems(placedItemTypes: ItemType[]) {
        return Object.keys(ItemType)
            .filter((key) => !isNaN(Number(key)))
            .map((key) => Number(key) as ItemType)
            .filter((type: ItemType) => type !== ItemType.Random && type !== ItemType.Start && !placedItemTypes.includes(type));
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

    private isItemAtCurrentPosition(currentPosition: Vec2, itemPosition: Vec2) {
        return currentPosition.x === itemPosition.x && currentPosition.y === itemPosition.y;
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
