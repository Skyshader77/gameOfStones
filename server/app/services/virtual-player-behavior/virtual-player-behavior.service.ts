import { AiPlayerActionInput } from '@app/constants/virtual-player.constants';
import { ClosestObject } from '@app/interfaces/ai-action';
import { RoomGame } from '@app/interfaces/room-game';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import {
    findNearestValidPosition,
    getAdjacentPositions,
    getNearestItemPosition,
    getNearestPlayerPosition,
    isCoordinateWithinBoundaries,
} from '@app/utils/utilities';
import { GameMode } from '@common/enums/game-mode.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VirtualPlayerBehaviorService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private doorManagerService: DoorOpeningService;
    @Inject() private fightManagerService: FightManagerService;
    isBeforeObstacle: boolean;
    isSeekingPlayers: boolean;
    hasSlipped: boolean;
    justWonFight: boolean;
    executeTurnAIPlayer(room: RoomGame, virtualPlayer: Player) {
        this.determineTurnAction(room, virtualPlayer);
    }

    // TODO return the new AIState to be able to switch states
    determineTurnAction(room: RoomGame, virtualPlayer: Player) {
        const closestPlayer = getNearestPlayerPosition(room, virtualPlayer.playerInGame.currentPosition);
        const closestItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition);
        console.log('Number of remaining Moves:' + virtualPlayer.playerInGame.remainingMovement);
        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            this.isSeekingPlayers = true;
            this.offensiveTurnAction(
                {
                    closestPlayer,
                    closestItem,
                },
                room,
                virtualPlayer,
            );
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            if (!this.itemManagerService.remainingDefensiveItemCount(room)) this.isSeekingPlayers = true;
            this.defensiveTurnAction(
                {
                    closestPlayer,
                    closestItem,
                },
                room,
                virtualPlayer,
            );
        }
    }

    private offensiveTurnAction(aiPlayerInput: AiPlayerActionInput, room: RoomGame, virtualPlayer: Player) {
        // AGGRESSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek the nearest player to fight.
        // If there is a player but no item in range, fight with the player.
        // If there is a damage/speed item and no player, go pick up the item.
        // If both are in range, go fight the player
        const closestOffensiveItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition, OFFENSIVE_ITEMS);
        if (this.canFight(virtualPlayer, aiPlayerInput)) {
            const opponentName = this.findPlayerAtPosition(aiPlayerInput.closestPlayer.position, room);
            console.log('starting fight');
            this.isBeforeObstacle = false;
            this.fightManagerService.startFight(room, opponentName);
        } else if (this.isBeforeObstacle && virtualPlayer.playerInGame.remainingActions > 0) {
            this.toggleDoorAi(room, virtualPlayer);
            this.isBeforeObstacle = false;
        } else if (this.hasFlag(virtualPlayer, room)) {
            this.moveToStartingPosition(virtualPlayer, room);
        } else if (this.isPlayerCloserThanItem(aiPlayerInput.closestPlayer, closestOffensiveItem, true) && !this.justWonFight) {
            console.log('Bot is moving towards player');
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayer.position;
            this.moveAi(nearestPlayerLocation, room, true);
        } else if (closestOffensiveItem.position) {
            console.log('Bot is moving towards Item');
            const itemLocation: Vec2 = closestOffensiveItem.position;
            this.moveAi(itemLocation, room, false);
        } else {
            this.moveAi(findNearestValidPosition({ room, startPosition: virtualPlayer.playerInGame.currentPosition }), room, false);
            console.log('Bot has entered the deadzone: Else statement that is currently not handled');
            // TODO random action (move closer to players, open door, get other item, etc.)
            // this.doRandomOffensiveAction();
        }
    }

    private canFight(virtualPlayer: Player, aiPlayerInput: AiPlayerActionInput) {
        return (
            virtualPlayer.playerInGame.remainingActions > 0 &&
            this.isFightAvailable(aiPlayerInput.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)
        );
    }

    private defensiveTurnAction(aiPlayerInput: AiPlayerActionInput, room: RoomGame, virtualPlayer) {
        // DEFENSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek nearest defensive item.
        // If there is a player but no item in range, but there is an item on the map, seek item.
        // If there are no defensive items but other items, seek these items.
        // If there is a defensive item, whatever the case go for the item.
        const closestDefensiveItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition, DEFENSIVE_ITEMS);

        if (this.canFight(virtualPlayer, aiPlayerInput) && this.isBeforeObstacle) {
            console.log('I have no choice but to fight');
            const opponentName = this.findPlayerAtPosition(aiPlayerInput.closestPlayer.position, room);
            this.fightManagerService.startFight(room, opponentName);
        } else if (this.isBeforeObstacle && virtualPlayer.playerInGame.remainingActions > 0) {
            this.toggleDoorAi(room, virtualPlayer);
            this.isBeforeObstacle = false;
        } else if (this.hasFlag(virtualPlayer, room)) {
            this.moveToStartingPosition(virtualPlayer, room);
        } else if (closestDefensiveItem.position) {
            console.log('Bot is moving towards defensive Item');
            const itemLocation: Vec2 = closestDefensiveItem.position;
            this.moveAi(itemLocation, room, true);
        } else if (aiPlayerInput.closestItem.position) {
            console.log('Bot is moving towards any item');
            const itemLocation: Vec2 = aiPlayerInput.closestItem.position;
            this.moveAi(itemLocation, room, true);
        } else {
            console.log('Bot is moving towards player');
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayer.position;
            this.moveAi(nearestPlayerLocation, room, true);
        }
    }

    private hasFlag(virtualPlayer: Player, room: RoomGame) {
        return room.game.mode === GameMode.CTF && virtualPlayer.playerInGame.inventory.includes(ItemType.Flag);
    }

    private moveToStartingPosition(virtualPlayer: Player, room: RoomGame) {
        const playerStartPosition = virtualPlayer.playerInGame.startPosition;
        this.moveAi(playerStartPosition, room, true);
    }

    private toggleDoorAi(room: RoomGame, virtualPlayer: Player): void {
        const doorPosition = this.getDoorPosition(virtualPlayer.playerInGame.currentPosition, room);
        if (doorPosition) {
            console.log('Bot is opening door');
            const server = this.socketManagerService.getGatewayServer(Gateway.Game);
            const newDoorState = this.doorManagerService.toggleDoor(room, doorPosition);
            server.to(room.room.roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newDoorState, doorPosition });
            virtualPlayer.playerInGame.remainingActions--;
        }
    }

    private moveAi(newPosition: Vec2, room: RoomGame, isSeekingPlayers: boolean) {
        const movementResult = this.playerMovementService.executePlayerMovement(newPosition, room, isSeekingPlayers);
        this.isBeforeObstacle = movementResult.isNextToInteractableObject;
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        room.game.hasPendingAction = true;
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.isOnItem) {
            this.itemManagerService.handleItemPickup(room, currentPlayer.playerInfo.userName);
        }
        if (movementResult.hasTripped) {
            server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, currentPlayer.playerInfo.userName);
            this.hasSlipped = true;
            return;
        }
        this.hasSlipped = false;
    }

    private isFightAvailable(closestPlayerPosition: Vec2, currentPlayerPosition: Vec2): boolean {
        return (
            (Math.abs(closestPlayerPosition.x - currentPlayerPosition.x) === 1 && closestPlayerPosition.y === currentPlayerPosition.y) ||
            (Math.abs(closestPlayerPosition.y - currentPlayerPosition.y) === 1 && closestPlayerPosition.x === currentPlayerPosition.x)
        );
    }

    private getDoorPosition(currentPlayerPosition: Vec2, room: RoomGame): Vec2 {
        const adjacentPositions = getAdjacentPositions(currentPlayerPosition);
        for (const position of adjacentPositions) {
            if (isCoordinateWithinBoundaries(position, room.game.map.mapArray)) {
                if (room.game.map.mapArray[position.y][position.x] === TileTerrain.ClosedDoor) {
                    return position;
                }
            }
        }
        return null;
    }

    private isPlayerCloserThanItem(closestPlayerPosition: ClosestObject, closestItemPosition: ClosestObject, isOffensiveAi: boolean): boolean {
        if (!closestItemPosition.position) {
            return true;
        }
        return closestPlayerPosition.cost !== closestItemPosition.cost ? closestPlayerPosition.cost < closestItemPosition.cost : isOffensiveAi;
    }

    private findPlayerAtPosition(opponentPosition: Vec2, room: RoomGame): string {
        for (const player of room.players) {
            if (player.playerInGame.currentPosition.x === opponentPosition.x && player.playerInGame.currentPosition.y === opponentPosition.y) {
                return player.playerInfo.userName;
            }
        }
        return null;
    }

    /* private doRandomOffensiveAction() {}
    private doRandomDefensiveAction() {} */
}
