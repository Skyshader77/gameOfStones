import { AiPlayerActionInput, AiPlayerActionOutput } from '@app/constants/virtual-player.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { getAdjacentPositions, getNearestItemPosition, getNearestPlayerPosition, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
import { DoorOpeningService } from '../door-opening/door-opening.service';
import { FightManagerService } from '../fight/fight/fight-manager.service';
import { ItemManagerService } from '../item-manager/item-manager.service';
import { SocketManagerService } from '../socket-manager/socket-manager.service';

@Injectable()
export class VirtualPlayerBehaviorService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private doorManagerService: DoorOpeningService;
    @Inject() private fightManagerService: FightManagerService;
    executeTurnAIPlayer(room: RoomGame, virtualPlayer: Player, isStuckInfrontOfDoor: boolean): AiPlayerActionOutput {
        return this.determineTurnAction(room, virtualPlayer, isStuckInfrontOfDoor);
    }

    // TODO return the new AIState to be able to switch states
    determineTurnAction(room: RoomGame, virtualPlayer: Player, isStuckInfrontOfDoor: boolean): AiPlayerActionOutput {
        const closestPlayerPosition = getNearestPlayerPosition(room, virtualPlayer.playerInGame.currentPosition);
        const closestItemPosition = getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition);
        let aiPlayerActionOutput: AiPlayerActionOutput;
        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            aiPlayerActionOutput = this.offensiveTurnAction(
                {
                    closestPlayerPosition: closestPlayerPosition,
                    closestItemPosition: closestItemPosition,
                    isStuckInfrontOfDoor: isStuckInfrontOfDoor,
                },
                room,
                virtualPlayer,
            );
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            aiPlayerActionOutput = this.defensiveTurnAction(
                {
                    closestPlayerPosition: closestPlayerPosition,
                    closestItemPosition: closestItemPosition,
                    isStuckInfrontOfDoor: isStuckInfrontOfDoor,
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
        let isStuckInfrontOfDoor = false;
        console.log('Am I stuck in front of door:' + aiPlayerInput.isStuckInfrontOfDoor);
        console.log('Number of remaining Actions:' + virtualPlayer.playerInGame.remainingActions);
        if (
            virtualPlayer.playerInGame.remainingActions > 0 &&
            this.isFightAvailable(aiPlayerInput.closestPlayerPosition, virtualPlayer.playerInGame.currentPosition)
        ) {
        } else if (aiPlayerInput.isStuckInfrontOfDoor && virtualPlayer.playerInGame.remainingActions > 0) {
            console.log('Bot is opening door');
            const doorPosition = this.getDoorPosition(virtualPlayer.playerInGame.currentPosition, room);
            if (doorPosition) {
                this.executeAiPostToggleDoorLogic(doorPosition, room);
                virtualPlayer.playerInGame.remainingActions--;
            }
            isStuckInfrontOfDoor = false;
        }

        //TODO: Replace this by a logic of if the item is closer to the targeted player
        else if (aiPlayerInput.closestPlayerPosition !== null) {
            console.log('Bot is moving towards player');
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayerPosition;
            const movementResult = this.playerMovementService.processPlayerMovement(nearestPlayerLocation, room, true);
            isStuckInfrontOfDoor = movementResult.isNextToInteractableObject;
            hasSlipped = this.executeAiPostMovementLogic(movementResult, room);
        } else if (aiPlayerInput.closestItemPosition !== null) {
            console.log('Bot is moving towards Item');
            const offensiveItemLocation: Vec2 = aiPlayerInput.closestItemPosition;
            const movementResult = this.playerMovementService.processPlayerMovement(offensiveItemLocation, room, false);
            isStuckInfrontOfDoor = movementResult.isNextToInteractableObject;
            hasSlipped = this.executeAiPostMovementLogic(movementResult, room);
        } else {
            // TODO random action (move closer to players, open door, get other item, etc.)
            // this.doRandomOffensiveAction();
        }
        return { hasSlipped, isStuckInfrontOfDoor: isStuckInfrontOfDoor };
    }

    private defensiveTurnAction(aiPlayerInput: AiPlayerActionInput, room: RoomGame, virtualPlayer): AiPlayerActionOutput {
        //DEFENSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek nearest defensive item.
        // If there is a player but no item in range, but there is an item on the map, seek item.
        // If there are no defensive items but other items, seek these items.
        // If there is a defensive item, whatever the case go for the item.
        //send endTurn here if the AI cannot do anything else.
        //const isDefensiveItemReachable=(this.detectClosestItem(DefensiveItemType)!==null);
        let hasSlipped = false;
        let isStuckInfrontOfDoor = false;
        if (aiPlayerInput.isStuckInfrontOfDoor && virtualPlayer.playerInGame.remainingActions > 0) {
            const doorPosition = this.getDoorPosition(virtualPlayer.playerInGame.currentPosition, room);
            if (doorPosition) {
                this.executeAiPostToggleDoorLogic(doorPosition, room);
            }
            isStuckInfrontOfDoor = false;
        } else if (aiPlayerInput.closestItemPosition !== null) {
            const offensiveItemLocation: Vec2 = aiPlayerInput.closestItemPosition;
            const movementResult = this.playerMovementService.processPlayerMovement(offensiveItemLocation, room, false);
            isStuckInfrontOfDoor = movementResult.isNextToInteractableObject;
            hasSlipped = this.executeAiPostMovementLogic(movementResult, room);
        } else {
            const nearestPlayerLocation: Vec2 = aiPlayerInput.closestPlayerPosition;
            const movementResult = this.playerMovementService.processPlayerMovement(nearestPlayerLocation, room, true);
            isStuckInfrontOfDoor = movementResult.isNextToInteractableObject;
            hasSlipped = this.executeAiPostMovementLogic(movementResult, room);
        }
        return { hasSlipped, isStuckInfrontOfDoor: isStuckInfrontOfDoor };
    }

    private executeAiPostToggleDoorLogic(doorPosition: Vec2, room: RoomGame): void {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const newDoorState = this.doorManagerService.toggleDoor(room, doorPosition);
        server.to(room.room.roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newDoorState, doorPosition });
    }

    private executeAiPostMovementLogic(movementResult: MovementServiceOutput, room: RoomGame): boolean {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
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

    /* private doRandomOffensiveAction() {}
    private doRandomDefensiveAction() {} */
}
