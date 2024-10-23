import { Injectable } from '@angular/core';
import { GameEvents, SocketRole } from '@app/constants/socket.constants';
import { MoveData } from '@app/interfaces/reachableTiles';
import { SocketService } from './socket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStartInformation } from '@app/interfaces/game-start';

@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    constructor(
        private socketService: SocketService,
        private router: Router,
    ) {}

    processMovement(movementData: MoveData) {
        this.socketService.emit<MoveData>(SocketRole.GAME, GameEvents.DesiredMove, movementData);
    }

    endTurn() {
        this.socketService.emit(SocketRole.GAME, GameEvents.EndTurn);
    }

    sendStartGame() {
        this.socketService.emit(SocketRole.GAME, GameEvents.DesireStartGame);
    }

    listenToStartGame(): Subscription {
        return this.socketService
            .on<GameStartInformation[]>(SocketRole.GAME, GameEvents.StartGame)
            .subscribe((startInformation: GameStartInformation[]) => {
                console.log(startInformation);
                // TODO order the player list to define the right play order
                this.router.navigate(['/play']);
            });
    }
}
