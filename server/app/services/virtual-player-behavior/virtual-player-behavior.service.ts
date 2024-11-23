import { AiPlayerActionInput, AiPlayerActionOutput } from '@app/constants/virtual-player.constants';
import { ClosestObject } from '@app/interfaces/ai-action';
import { RoomGame } from '@app/interfaces/room-game';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { getRangeNearbyPositions, getNearestItemPosition, getNearestPlayerPosition, isCoordinateWithinBoundaries, getAdjacentPositions } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
import { DoorOpeningService } from '../door-opening/door-opening.service';
import { FightManagerService } from '../fight/fight/fight-manager.service';
import { ItemManagerService } from '../item-manager/item-manager.service';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
import { GameMode } from '@common/enums/game-mode.enum';

@Injectable()
export class VirtualPlayerBehaviorService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private doorManagerService: DoorOpeningService;
    @Inject() private fightManagerService: FightManagerService;
    public isBeforeObstacle: boolean = false;
    executeTurnAIPlayer(room: RoomGame, virtualPlayer: Player): AiPlayerActionOutput {
        return this.determineTurnAction(room, virtualPlayer);
    }

    // TODO return the new AIState to be able to switch states
    determineTurnAction(room: RoomGame, virtualPlayer: Player): AiPlayerActionOutput {
        const closestPlayer = getNearestPlayerPosition(room, virtualPlayer.playerInGame.currentPosition);
        const closestItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition);
        if (closestItem.position) {
            console.log('Closest Item to AI in x:' + closestItem.position.x);
            console.log('Closest Item to AI in y:' + closestItem.position.y);
        }
        console.log('Number of remaining Moves:' + virtualPlayer.playerInGame.remainingMovement);
        let aiPlayerActionOutput: AiPlayerActionOutput;
        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            aiPlayerActionOutput = this.offensiveTurnAction(
                {
                    closestPlayer: closestPlayer,
                    closestItem: closestItem,
                },
                room,
                virtualPlayer,
            );
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            aiPlayerActionOutput = this.defensiveTurnAction(
                {
                    closestPlayer: closestPlayer,
                    closestItem: closestItem,
                },
                room,
                virtualPlayer,
            );
        }
        return aiPlayerActionOutput;
    }

    private offensiveTurnAction(aiPlayerInput: AiPlayerActionInput, room: RoomGame, virtualPlayer: Player): AiPlayerActionOutput {
        //AGGRESSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek the nearest player to fight.
        // If there is a player but no item in range, fight with the player.
        // If there is a damage/speed item and no player, go pick up the item.
        // If both are in range, go fight the player
        let hasSlipped = false;
        console.log('Am I stuck in front of door:' + this.isBeforeObstacle);
        console.log('Number of remaining Actions:' + virtualPlayer.playerInGame.remainingActions);
        console.log('Number of remaining Moves:' + virtualPlayer.playerInGame.remainingMovement);
        const closestOffensiveItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition, OFFENSIVE_ITEMS);
        if (this.canFight(virtualPlayer, aiPlayerInput)) {
            console.log('I can fight');
            const opponentName = this.findPlayerAtPosition(aiPlayerInput.closestPlayer.position, room);
            this.fightManagerService.startFight(room, opponentName);
        } else if (this.isBeforeObstacle && virtualPlayer.playerInGame.remainingActions > 0) {
            this.toggleDoorAi(room, virtualPlayer);
            this.isBeforeObstacle = false;
        }
        if (this.isStuckWithNoActions(virtualPlayer.playerInGame.remainingActions)) {
            console.log('I am stuck because a player or door is in front of me and I cant attack or interact with throwIfEmpty.');
            virtualPlayer.playerInGame.remainingMovement = 0;
        } else if (this.hasFlag(virtualPlayer, room)) {
            hasSlipped = this.moveToStartingPosition(virtualPlayer, room);
        }
        else if (this.isPlayerCloserThanItem(aiPlayerInput.closestPlayer, closestOffensiveItem, true)) {
            console.log('Bot is moving towards player');
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayer.position;
            hasSlipped = this.moveAi(nearestPlayerLocation, room, true);
        } else if (closestOffensiveItem.position) {
            console.log('Bot is moving towards Item');
            const itemLocation: Vec2 = closestOffensiveItem.position;
            hasSlipped = this.moveAi(itemLocation, room, false);
        } else {
            console.log('Bot has entered the deadzone: Else statement that is currently not handled');
            // TODO random action (move closer to players, open door, get other item, etc.)
            // this.doRandomOffensiveAction();
        }
        return { hasSlipped };
    }

    private isStuckWithNoActions(numbRemainingActions: number) {
        return this.isBeforeObstacle && numbRemainingActions === 0;
    }

    private canFight(virtualPlayer: Player, aiPlayerInput: AiPlayerActionInput) {
        return (
            virtualPlayer.playerInGame.remainingActions > 0 &&
            this.isFightAvailable(aiPlayerInput.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)
        );
    }


    private defensiveTurnAction(aiPlayerInput: AiPlayerActionInput, room: RoomGame, virtualPlayer): AiPlayerActionOutput {
        //DEFENSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek nearest defensive item.
        // If there is a player but no item in range, but there is an item on the map, seek item.
        // If there are no defensive items but other items, seek these items.
        // If there is a defensive item, whatever the case go for the item.
        const closestDefensiveItem = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition, DEFENSIVE_ITEMS);
        let hasSlipped = false;

        if (this.canFight(virtualPlayer, aiPlayerInput) && this.isBeforeObstacle) {
            console.log('I have no choice but to fight');
            const opponentName = this.findPlayerAtPosition(aiPlayerInput.closestPlayer.position, room);
            this.fightManagerService.startFight(room, opponentName);
        } else if (this.isBeforeObstacle && virtualPlayer.playerInGame.remainingActions > 0) {
            this.toggleDoorAi(room, virtualPlayer);
            this.isBeforeObstacle = false;
        }
        if (this.isStuckWithNoActions(virtualPlayer.playerInGame.remainingActions)) {
            virtualPlayer.playerInGame.remainingMovement = 0;
        }
        else if (this.hasFlag(virtualPlayer, room)) {
            hasSlipped = this.moveToStartingPosition(virtualPlayer, room);
        }
        else if (closestDefensiveItem.position) {
            console.log('Bot is moving towards defensive Item');
            const itemLocation: Vec2 = closestDefensiveItem.position;
            hasSlipped = this.moveAi(itemLocation, room, true);
        } else if (aiPlayerInput.closestItem.position) {
            console.log('Bot is moving towards any item');
            const itemLocation: Vec2 = aiPlayerInput.closestItem.position;
            hasSlipped = this.moveAi(itemLocation, room, true);
        } else {
            console.log('Bot is moving towards player');
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayer.position;
            hasSlipped = this.moveAi(nearestPlayerLocation, room, true);
        }
        return { hasSlipped };
    }

    private hasFlag(virtualPlayer: Player, room: RoomGame) {
        return room.game.mode === GameMode.CTF && virtualPlayer.playerInGame.inventory.includes(ItemType.Flag);
    }

    private moveToStartingPosition(virtualPlayer: Player, room: RoomGame): boolean {
        const playerStartPosition = virtualPlayer.playerInGame.startPosition;
        return this.moveAi(playerStartPosition, room, true);
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

    private moveAi(newPosition: Vec2, room: RoomGame, isSeekingPlayers: boolean): boolean {
        const movementResult = this.playerMovementService.executePlayerMovement(newPosition, room, isSeekingPlayers);
        this.isBeforeObstacle = movementResult.isNextToInteractableObject;
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        room.game.hasPendingAction = true;
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.isOnItem) {
            this.itemManagerService.handleItemPickup(room, currentPlayer.playerInfo.userName, movementResult.hasTripped);
        }
        if (movementResult.hasTripped) {
            server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, currentPlayer.playerInfo.userName);
            return true;
        }
        return false;
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
