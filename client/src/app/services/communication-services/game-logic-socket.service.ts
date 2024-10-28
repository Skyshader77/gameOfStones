import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameStartInformation } from '@app/interfaces/game-start';
import { TileTerrain } from '@app/interfaces/map';
import { MoveData } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/room.events';
@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    constructor(
        private socketService: SocketService,
        private router: Router,
    ) {}

    processMovement(movementData: MoveData) {
        this.socketService.emit<MoveData>(Gateway.GAME, GameEvents.DesiredMove, movementData);
    }

    listenToPlayerMove(): Subscription {
        return this.socketService
            .on<MovementServiceOutput>(Gateway.GAME, GameEvents.PlayerMove)
            .subscribe((movementOutput: MovementServiceOutput) => {
                console.log(movementOutput);
                // TODO: Update the player position on the renderer.
            });
    }

    endTurn() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndTurn);
    }

    listenToEndTurn(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            console.log(nextPlayerName);
            // TODO: Set the current player on the Game side on the client
        });
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredDoor, doorLocation);
    }

    listenToOpenDoor(): Subscription {
        return this.socketService.on<TileTerrain>(Gateway.GAME, GameEvents.PlayerDoor).subscribe((newDoorState: TileTerrain) => {
            console.log(newDoorState);
            // TODO: Change the door state on the renderer.
        });
    }

    sendStartGame() {
        this.socketService.emit(Gateway.GAME, GameEvents.DesireStartGame);
    }

    listenToStartGame(): Subscription {
        return this.socketService
            .on<GameStartInformation[]>(Gateway.GAME, GameEvents.StartGame)
            .subscribe((startInformation: GameStartInformation[]) => {
                console.log(startInformation);
                // TODO order the player list to define the right play order
                this.router.navigate(['/play']);
            });
    }
}
