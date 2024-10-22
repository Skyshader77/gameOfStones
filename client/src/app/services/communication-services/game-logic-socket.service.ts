import { Injectable } from '@angular/core';
import { GameEvents, SocketRole } from '@app/constants/socket.constants';
import { MoveData } from '@app/interfaces/reachableTiles';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    constructor(private socketService: SocketService) {}

    processMovement(movementData: MoveData) {
        this.socketService.getSockets.get(SocketRole.GAME)?.emit(GameEvents.DesiredMove, movementData);
    }

    endTurn(){
        this.socketService.getSockets.get(SocketRole.GAME)?.emit(GameEvents.EndTurn);
    }

    startGame(){
        this.socketService.getSockets.get(SocketRole.GAME)?.emit(GameEvents.StartGame);
    }
}
