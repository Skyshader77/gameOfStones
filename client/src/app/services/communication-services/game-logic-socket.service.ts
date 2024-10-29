import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MoveData } from '@app/interfaces/reachable-tiles';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { Vec2 } from '@common/interfaces/vec2';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '../time-services/game-time.service';
import { MapRenderingStateService } from '../rendering-services/map-rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    constructor(
        private socketService: SocketService,
        private playerListService: PlayerListService,
        private gameTimeService: GameTimeService,
        private router: Router,
        private mapRenderingStateService: MapRenderingStateService
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

    listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            console.log(nextPlayerName);
            // TODO: Set the current player on the Game side on the client
        });
    }

    listenToStartTurn(): Subscription {
        return this.socketService.on<number>(Gateway.GAME, GameEvents.StartTurn).subscribe((initialTime: number) => {
            this.gameTimeService.initialize(initialTime);
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
        return this.socketService.on<GameStartInformation>(Gateway.GAME, GameEvents.StartGame).subscribe((startInformation: GameStartInformation) => {
            this.playerListService.preparePlayersForGameStart(startInformation.playerStarts);
            this.mapRenderingStateService.map = startInformation.map;
            this.router.navigate(['/play']);
        });
    }
}
