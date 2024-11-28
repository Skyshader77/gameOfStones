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
                justWonFight: false,
                aiTurnSubject: subject,
                aiTurnSubscription: null,
            };
        }
    }

    initiateVirtualPlayerTurn(room: RoomGame) {
        room.game.virtualState.isBeforeObstacle = false;
        room.game.virtualState.isSeekingPlayers = false;
        room.game.virtualState.hasSlipped = false;
        room.game.virtualState.justWonFight = false;
    }

    setJustWonFight(room: RoomGame) {
        room.game.virtualState.justWonFight = true;
    }
}
