import { BOMB_ANIMATION_DELAY_MS } from '@app/constants/item.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item, ItemLostHandler } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { findPlayerAtPosition, isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { ItemUsedPayload } from '@common/interfaces/item';
import { DeadPlayerPayload, Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ItemManagerService {
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private gameStatsService: GameStatsService;
    @Inject() private pathFindingService: PathFindingService;
    @Inject() private specialItemService: SpecialItemService;

    hasToDropItem(player: Player) {
        return player.playerInGame.inventory.length > MAX_INVENTORY_SIZE;
    }

    determineSpecialItemRespawnPosition(room: RoomGame) {
        const xPos = Math.floor(Math.random() * room.game.map.size);
        const yPos = Math.floor(Math.random() * room.game.map.size);
        return this.pathFindingService.findNearestValidPosition({
            room,
            startPosition: { x: xPos, y: yPos },
            isSeekingPlayers: false,
            checkForItems: true,
        });
    }

    addRemovedSpecialItems(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        for (const itemType of room.game.removedSpecialItems) {
            const respawnPosition = this.determineSpecialItemRespawnPosition(room);
            const item: Item = { type: itemType, position: { x: respawnPosition.x, y: respawnPosition.y } };
            this.setItemAtPosition(item, room.game.map, respawnPosition);
            server.to(room.room.roomCode).emit(GameEvents.ItemPlaced, item);
        }
        room.game.removedSpecialItems = [];
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

    handlePlayerDeath(room: RoomGame, player: Player, usedSpecialItem: ItemType | null): DeadPlayerPayload {
        const respawnPosition = {
            x: player.playerInGame.startPosition.x,
            y: player.playerInGame.startPosition.y,
        };
        this.handleInventoryLoss(player, room, usedSpecialItem);
        player.playerInGame.currentPosition = {
            x: respawnPosition.x,
            y: respawnPosition.y,
        };
        return { player, respawnPosition };
    }

    handleItemUsed(room: RoomGame, playerName: string, itemUsedPayload: ItemUsedPayload) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        switch (itemUsedPayload.type) {
            case ItemType.GeodeBomb: {
                const bombResult: DeadPlayerPayload[] = this.handleBombUsed(room, itemUsedPayload.usagePosition);
                server.to(room.room.roomCode).emit(GameEvents.BombUsed);

                setTimeout(() => server.to(room.room.roomCode).emit(GameEvents.PlayerDead, bombResult), BOMB_ANIMATION_DELAY_MS);
                break;
            }
            case ItemType.GraniteHammer: {
                const hammerResult = this.handleHammerUsed(room, playerName, itemUsedPayload.usagePosition);
                server.to(room.room.roomCode).emit(GameEvents.HammerUsed);
                server.to(room.room.roomCode).emit(GameEvents.PlayerDead, hammerResult);
                break;
            }
        }
    }

    handleItemLost(itemLostHandler: ItemLostHandler) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(itemLostHandler.room.room.roomCode, itemLostHandler.playerName);
        const isUsedSpecialItem: boolean = itemLostHandler.isUsedSpecialItem;
        const item = this.loseItem(itemLostHandler.room, player, itemLostHandler.itemType, itemLostHandler.itemDropPosition, isUsedSpecialItem);
        if (!isUsedSpecialItem) {
            server
                .to(itemLostHandler.room.room.roomCode)
                .emit(GameEvents.ItemDropped, { playerName: itemLostHandler.playerName, newInventory: player.playerInGame.inventory, item });
        } else {
            server
                .to(itemLostHandler.room.room.roomCode)
                .emit(GameEvents.ItemLost, { playerName: itemLostHandler.playerName, newInventory: player.playerInGame.inventory });
        }
    }

    handleItemDrop(room: RoomGame, playerName: string, itemType: ItemType) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const item = this.dropItem(room, player, itemType);
        server.to(room.room.roomCode).emit(GameEvents.ItemDropped, { playerName, newInventory: player.playerInGame.inventory, item });
    }

    handleItemPickup(room: RoomGame, player: Player) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const playerTileItem = this.getPlayerTileItem(room, player);
        if (!this.isItemGrabbable(playerTileItem.type) || !playerTileItem) return;
        const isInventoryFull: boolean = this.isInventoryFull(player);
        this.pickUpItem(room, player, playerTileItem.type);

        server.to(room.room.roomCode).emit(GameEvents.ItemPickedUp, { newInventory: player.playerInGame.inventory, itemType: playerTileItem.type });
        if (isInventoryFull) {
            this.handleFullInventory(room, player);
        }
    }

    remainingDefensiveItemCount(room: RoomGame) {
        return room.game.map.placedItems.filter((item) => DEFENSIVE_ITEMS.includes(item.type)).length;
    }

    handleInventoryLoss(player: Player, room: RoomGame, usedSpecialItem: ItemType | null): void {
        player.playerInGame.inventory.forEach((item) => {
            const isUsedSpecialItem: boolean = item === usedSpecialItem;
            this.handleItemLost({
                room,
                playerName: player.playerInfo.userName,
                itemDropPosition: player.playerInGame.currentPosition,
                itemType: item,
                isUsedSpecialItem,
            });
        });
    }

    handleRespawn(room: RoomGame, player: Player, usedSpecialItem: ItemType | null): DeadPlayerPayload {
        const respawnPosition = this.pathFindingService.getReSpawnPosition(player, room);
        this.handleInventoryLoss(player, room, usedSpecialItem);
        player.playerInGame.currentPosition = {
            x: respawnPosition.x,
            y: respawnPosition.y,
        };
        return { player, respawnPosition };
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

    private handleBombUsed(room: RoomGame, usagePosition: Vec2): DeadPlayerPayload[] {
        const bombResult: DeadPlayerPayload[] = [];
        room.game.isCurrentPlayerDead = true;
        for (let x = 0; x < room.game.map.size; x++) {
            for (let y = 0; y < room.game.map.size; y++) {
                const tilePosition: Vec2 = { x, y };
                if (this.shouldBombKillPlayerOnTile(usagePosition, tilePosition, room)) {
                    const player = findPlayerAtPosition(tilePosition, room);
                    const result: DeadPlayerPayload = this.handlePlayerDeath(room, player, ItemType.GeodeBomb);
                    bombResult.push(result);
                }
            }
        }
        return bombResult;
    }

    private handleHammerUsed(room: RoomGame, playerName: string, usagePosition: Vec2) {
        const players = room.players;
        const hammerResult: DeadPlayerPayload[] = [];
        const playerUsed = players.find((player) => player.playerInfo.userName === playerName);
        const playerAffected = players.find(
            (player) => player.playerInGame.currentPosition.x === usagePosition.x && player.playerInGame.currentPosition.y === usagePosition.y,
        );
        const affectedTiles = this.specialItemService.determineHammerAffectedTiles(playerUsed, usagePosition, room).affectedTiles;
        const lastHit = affectedTiles[affectedTiles.length - 1];
        const hitPlayer = players.find(
            (player) => player.playerInGame.currentPosition.x === lastHit.x && player.playerInGame.currentPosition.y === lastHit.y,
        );
        if (hitPlayer) {
            hammerResult.push(this.handlePlayerDeath(room, hitPlayer, null));
        }
        const playerDeathPosition = affectedTiles.length === 1 ? usagePosition : affectedTiles[affectedTiles.length - 2];
        playerAffected.playerInGame.currentPosition = { x: playerDeathPosition.x, y: playerDeathPosition.y };
        hammerResult.push(this.handlePlayerDeath(room, playerAffected, null));
        this.handleItemLost({
            isUsedSpecialItem: true,
            room,
            playerName,
            itemType: ItemType.GraniteHammer,
            itemDropPosition: usagePosition,
        });
        return hammerResult;
    }

    private shouldBombKillPlayerOnTile(usagePosition: Vec2, tilePosition: Vec2, room: RoomGame): boolean {
        return (
            (this.specialItemService.isTileInBombRange(usagePosition, tilePosition, room.game.map.size) &&
                isAnotherPlayerPresentOnTile(tilePosition, room.players)) ||
            (tilePosition.x === usagePosition.x && tilePosition.y === usagePosition.y)
        );
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

    private loseItem(room: RoomGame, player: Player, itemType: ItemType, itemDropPosition: Vec2, isUsedSpecialItem: boolean): Item {
        if (!this.isItemInInventory(player, itemType)) return;

        let item: Item;

        if (isUsedSpecialItem) {
            item = { type: itemType, position: null };
            room.game.removedSpecialItems.push(itemType);
        } else {
            const newItemPosition = this.pathFindingService.findNearestValidPosition({
                room,
                startPosition: itemDropPosition,
                checkForItems: true,
            });
            if (!newItemPosition) return;
            item = { type: itemType, position: { x: newItemPosition.x, y: newItemPosition.y } };
            this.setItemAtPosition(item, room.game.map, newItemPosition);
        }

        this.removeItemFromInventory(itemType, player);
        return item;
    }
}
