import { VirtualPlayerState } from '@app/interfaces/ai-state';
import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class VirtualPlayerStateService {
    initializeVirtualPlayerState(room: RoomGame) {
        if (!room.game.virtualState.aiTurnSubject) {
            const subject = new Subject<void>();
            room.game.virtualState = {
                // isBeforeObstacle: false,
                obstacle: null,
                isSeekingPlayers: false,
                hasSlipped: false,
                justWonFight: false,
                aiTurnSubject: subject,
                aiTurnSubscription: null,
            };
        }
    }

    initiateVirtualPlayerTurn(room: RoomGame) {
        room.game.virtualState.obstacle = null;
        // room.game.virtualState.isBeforeObstacle = false;
        room.game.virtualState.isSeekingPlayers = false;
        room.game.virtualState.hasSlipped = false;
        room.game.virtualState.justWonFight = false;
    }

    getVirtualState(room: RoomGame): VirtualPlayerState {
        return room.game.virtualState;
    }

    handleMovement(room: RoomGame, movementResult: MovementServiceOutput) {
        const virtualPlayerState = this.getVirtualState(room);
        virtualPlayerState.obstacle = movementResult.interactiveObject;
        virtualPlayerState.hasSlipped = movementResult.hasTripped;
        if (virtualPlayerState.obstacle && movementResult.optimalPath.path.length === 0) {
            room.game.hasPendingAction = false;
            room.game.virtualState.aiTurnSubject.next();
        }
    }

    handleDoor(room: RoomGame, newDoor: TileTerrain) {
        const virtualPlayerState = this.getVirtualState(room);
        if (virtualPlayerState.obstacle && newDoor === TileTerrain.OpenDoor) {
            virtualPlayerState.obstacle = null;
        }
    }

    isBeforeObstacle(room: RoomGame): boolean {
        return Boolean(room.game.virtualState.obstacle);
    }

    hasSlipped(room: RoomGame): boolean {
        return room.game.virtualState.hasSlipped;
    }

    setFightResult(game: Game) {
        game.virtualState.justWonFight = game.fight.fighters.some((fighter) => fighter.playerInfo.userName === game.fight.result.winner);
    }
}
