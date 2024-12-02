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
                obstacle: null,
                isSeekingPlayers: false,
                justExitedFight: false,
                aiTurnSubject: subject,
                aiTurnSubscription: null,
            };
        }
    }

    initiateVirtualPlayerTurn(room: RoomGame) {
        room.game.virtualState.obstacle = null;
        room.game.virtualState.isSeekingPlayers = true;
        room.game.virtualState.justExitedFight = false;
    }

    getVirtualState(game: Game): VirtualPlayerState {
        return game.virtualState;
    }

    handleMovement(room: RoomGame, movementResult: MovementServiceOutput) {
        const virtualPlayerState = this.getVirtualState(room.game);
        virtualPlayerState.obstacle = movementResult.interactiveObject;
        if (movementResult.optimalPath.path.length === 0) {
            room.game.hasPendingAction = false;
            room.game.virtualState.aiTurnSubject.next();
        }
    }

    handleDoor(room: RoomGame, newDoor: TileTerrain) {
        const virtualPlayerState = this.getVirtualState(room.game);
        if (virtualPlayerState.obstacle && newDoor === TileTerrain.OpenDoor) {
            virtualPlayerState.obstacle = null;
        }
    }

    isBeforeObstacle(room: RoomGame): boolean {
        return Boolean(room.game.virtualState.obstacle);
    }

    setFightResult(game: Game) {
        game.virtualState.justExitedFight = true;
        if (game.fight && game.fight.result.winner) {
            game.virtualState.obstacle = null;
        }
    }

    setIsSeekingPlayers(game: Game, isSeekingPlayers: boolean) {
        game.virtualState.isSeekingPlayers = isSeekingPlayers;
    }
}
