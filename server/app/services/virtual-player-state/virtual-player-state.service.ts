import { VirtualPlayerState } from '@app/interfaces/ai-state';
import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class VirtualPlayerStateService {
    initializeVirtualPlayerState(room: RoomGame) {
        if (!room.game.virtualState.aiTurnSubject) {
            const subject = new Subject<void>();
            room.game.virtualState = {
                isBeforeObstacle: false,
                isSeekingPlayers: false,
                hasSlipped: false,
                justExitedFight: false,
                aiTurnSubject: subject,
                aiTurnSubscription: null,
            };
        }
    }

    initiateVirtualPlayerTurn(room: RoomGame) {
        room.game.virtualState.isBeforeObstacle = false;
        room.game.virtualState.isSeekingPlayers = false;
        room.game.virtualState.hasSlipped = false;
        room.game.virtualState.justExitedFight = false;
    }

    getVirtualState(room: RoomGame): VirtualPlayerState {
        return room.game.virtualState;
    }

    isBeforeObstacle(room: RoomGame): boolean {
        return room.game.virtualState.isBeforeObstacle;
    }

    hasSlipped(room: RoomGame): boolean {
        return room.game.virtualState.hasSlipped;
    }

    setFightResult(game: Game) {
        game.virtualState.justExitedFight = true;
    }
}
