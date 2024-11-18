import { AiState } from '@app/interfaces/ai-action';
import { RoomGame } from '@app/interfaces/room-game';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
import { PlayerMovementService } from '../player-movement/player-movement.service';

@Injectable()
export class VirtualPlayerBehaviorService {
    private virtualPlayerStates: Map<string, AiState>; //String is the virtual playerName
    @Inject() private playerMovementService: PlayerMovementService;

    executeTurnAIPlayer(virtualPlayer: Player) {
        //TODO: will probably need a while loop to use manageTurnAIPlayer within it.
        // while(){
        //     manageActionsAIPlayer
        // }
    }

    manageActionsAIPlayer(room: RoomGame, virtualPlayer: Player) {
        //TODO: initialize state as AiState.StartTurn at the beginning of the AI player's turn
        // TODO add a number of clock ticks to make the AI player wait a bit before doing any action
        const AiPlayerState = this.virtualPlayerStates.get(virtualPlayer.playerInfo.userName);
        switch (AiPlayerState) {
            case AiState.StartTurn:
                //Initialize movements/ hp/ etc using game gateway or other services.
                //Move to AiState.CalculatingNextAction.
                break;
            case AiState.Moving: {
                //Switch to AIState.Action if the AI is next to a player or needs to open a door to advance
                //Else go to AiState.CalculatingNextAction.
                break;
            }
            case AiState.Action: {
                //Opens door if it has to.
                //Switch to AIState.Fighting if it can fight with player
                //Else go to AiState.CalculatingNextAction.
                break;
            }
            case AiState.Fighting: {
                //Switch to AiState.CalculatingNextAction. at the end of the battle.
                break;
            }

            default: {
                // This corresponds to AiState.CalculatingNextAction.
                this.determineTurnAction(room, virtualPlayer);
                break;
            }
        }

    }

    // TODO return the new AIState to be able to switch states
    determineTurnAction(room: RoomGame, virtualPlayer: Player) {
        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            this.offensiveTurnAction(room, virtualPlayer);
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            this.defensiveTurnAction(room, virtualPlayer);
        }
    }

    determineFightAction(room: RoomGame, virtualPlayer: Player) {
        if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            //  TODO: Make the defensiveAI evade if they still have some evasions left.
        }
    }


    private offensiveTurnAction(room: RoomGame, virtualPlayer: Player) {
        //AGGRESSIVE  VP BEHAVIOR :
        // If there is no player / item in range, seek the nearest player to fight.
        // If there is a player but no item in range, fight with the player.
        // If there is a damage/speed item and no player, go pick up the item.
        // If both are in range, go fight the player
        const isOffensiveItemReachable = false;
        //const isOffensiveItemReachable=(this.detectClosestItem(OffensiveItemType)!==null);
        if (virtualPlayer.playerInGame.remainingActions > 0 && this.isFightAvailable()) {
            // TODO player is right next to the ai. trigger the fight (bomb/hammer?)
        } else if (virtualPlayer.playerInGame.remainingActions > 0 && this.isPlayerReachableWithoutActions()) {
            // TODO move to the player, and then later will trigger the fight ^^^
            const nearestPlayerLocation: Vec2 = { x: 0, y: 0 };
            this.playerMovementService.processPlayerMovement(nearestPlayerLocation, room, true);
        } else if (isOffensiveItemReachable) {
            // TODO go get the item
            const offensiveItemLocation: Vec2 = { x: 0, y: 0 };
            this.playerMovementService.processPlayerMovement(offensiveItemLocation, room, false);

        } else {
            // TODO random action (move closer to players, open door, get other item, etc.)
            // this.doRandomOffensiveAction();
        }
    }

    private defensiveTurnAction(room: RoomGame, virtualPlayer: Player) {
        //DEFENSIVE  VP BEHAVIOR :    
        // If there is no player / item in range, seek nearest defensive item.
        // If there is a player but no item in range, but there is an item on the map, seek item.
        // If there are no defensive items but other items, seek these items.
        // If there is a defensive item, whatever the case go for the item.
        //send endTurn here if the AI cannot do anything else.
        const isDefensiveItemReachable = false;
        //const isDefensiveItemReachable=(this.detectClosestItem(DefensiveItemType)!==null);

    }

    private getCloserToItem(itemType: ItemType) {
        //TODO: get closer to player
    }

    private getCloserToPlayer(playerName: String) {
        //TODO: get closer to player
    }

    private detectClosestItem(itemType: ItemType) {
        //TODO: return position of closest item or null if none are found
        return { x: 0, y: 0 };
    }

    private detectClosestPlayer(): Vec2 {
        //TODO: return position of closest player
        return { x: 0, y: 0 };
    }

    private isFightAvailable(): boolean {
        return false; // TODO fight right next to you
    }

    private isPlayerReachableWithoutActions(): boolean {
        return false; // TODO can travel to the position of the player -1
    }


    private makeVirtualPlayerWait() {
        //Make the AI player wait before executing any action
    }

    /* private doRandomOffensiveAction() {}
    private doRandomDefensiveAction() {} */
}
