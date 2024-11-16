import { RoomGame } from '@app/interfaces/room-game';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VirtualPlayerBehaviorService {
    // TODO this will require a kind of action queue in the server to execute the correct actions at the
    //      correct time

    // createPlayer() {}

    // TODO sets the initial attributes for the turn (when to play and what to do, etc.)
    determineTurnAction(room: RoomGame, virtualPlayer: Player) {
        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            this.offensiveTurnAction(room, virtualPlayer);
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            //  this.defensiveTurnAction(room, virtualPlayer);
        }
    }

    // determineFightAction() {}
    // TODO every clock tick, this gets called and the actual actions will be done
    // updateTurn() {}

    // private assignName() {}
    // private assignAvatar() {}
    // private assignBonus() {}

    private offensiveTurnAction(room: RoomGame, virtualPlayer: Player) {
        if (virtualPlayer.playerInGame.remainingActions > 0 && this.isFightAvailable()) {
            // TODO player is right next to the ai. trigger the fight (bomb/hammer?)
        } else if (virtualPlayer.playerInGame.remainingActions > 0 && this.isPlayerReachableWithoutActions()) {
            // TODO move to the player, and then latter will trigger the fight ^^^
        } else if (this.isOffensiveItemReachable()) {
            // TODO go get the item
        } else {
            // TODO random action (move closer to players, open door, get other item, etc.)
            // this.doRandomOffensiveAction();
        }
    }

    private isFightAvailable(): boolean {
        return false; // TODO fight right next to you
    }

    private isPlayerReachableWithoutActions(): boolean {
        return false; // TODO can travel to the position of the player -1
    }

    private isOffensiveItemReachable(): boolean {
        return false; // TODO path find to the position of an item
    }

    /* private doRandomOffensiveAction() {}

    private defensiveTurnAction(room: RoomGame, virtualPlayer: Player) {
        if (this.isDefensiveItemReachable()) {
            // TODO go get the item
        } else if (this.isOffensiveItemReachable()) {
            // TODO go get any other item if it is reachable
        } else {
            // TODO random action (start fight, move away from players, door, etc.)
            this.doRandomDefensiveAction();
        }
    }

    private isDefensiveItemReachable(): boolean {
        return false; // TODO path find to the position of an item
    }

    private doRandomDefensiveAction() {} */
}
