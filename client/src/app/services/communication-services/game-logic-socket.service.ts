import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameStartInformation } from '@common/interfaces/game-start-info';
import { PlayerAbandonOutput } from '@common/interfaces/gameGatewayOutputs';
import { MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
@Injectable({
    providedIn: 'root',
})
export class GameLogicSocketService {
    currentPlayer: string;
    constructor(
        private socketService: SocketService,
        private playerListService: PlayerListService,
        private gameTimeService: GameTimeService,
        private router: Router,
        private gameMap: GameMapService,
    ) {}

    processMovement(destination: Vec2) {
        this.socketService.emit<Vec2>(Gateway.GAME, GameEvents.DesiredMove, destination);
    }

    listenToPlayerMove(): Observable<MovementServiceOutput> {
        return this.socketService.on<MovementServiceOutput>(Gateway.GAME, GameEvents.PlayerMove);
    }

    endTurn() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndTurn);
    }

    endAction() {
        this.socketService.emit(Gateway.GAME, GameEvents.EndAction);
    }

    listenToChangeTurn(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.ChangeTurn).subscribe((nextPlayerName: string) => {
            this.currentPlayer = nextPlayerName;
            // TODO: Set the current player on the Game side on the client
        });
    }

    listenToStartTurn(): Subscription {
        return this.socketService.on<number>(Gateway.GAME, GameEvents.StartTurn).subscribe((initialTime: number) => {
            this.gameTimeService.setStartTime(initialTime);
            // TODO: Set the current player on the Game side on the client
        });
    }

    listenToMovementPreview(): Observable<ReachableTile[]> {
        return this.socketService.on<ReachableTile[]>(Gateway.GAME, GameEvents.MapPreview);
    }

    sendOpenDoor(doorLocation: Vec2) {
        this.socketService.emit(Gateway.GAME, GameEvents.DesiredDoor, doorLocation);
    }

    // listenToOpenDoor(): Subscription {
    //     return this.socketService.on<DoorOpeningOutput>(Gateway.GAME, GameEvents.PlayerDoor).subscribe((newDoorState: DoorOpeningOutput) => {
    //         this.mapRenderingStateService.updateDoorState(newDoorState.updatedTileTerrain, newDoorState.doorPosition);
    //     });
    // }

    sendStartGame() {
        this.socketService.emit(Gateway.GAME, GameEvents.DesireStartGame);
    }

    sendPlayerAbandon() {
        this.socketService.emit(Gateway.GAME, GameEvents.Abandoned);
    }

    listenToPlayerAbandon(): Observable<PlayerAbandonOutput> {
        return this.socketService.on<PlayerAbandonOutput>(Gateway.GAME, GameEvents.PlayerAbandoned);
    }

    listenToStartGame(): Subscription {
        return this.socketService.on<GameStartInformation>(Gateway.GAME, GameEvents.StartGame).subscribe((startInformation: GameStartInformation) => {
            this.router.navigate(['/play']);
            this.playerListService.preparePlayersForGameStart(startInformation.playerStarts);
            this.gameMap.map = startInformation.map;
        });
    }

    listenToPossiblePlayerMovement(): Observable<ReachableTile[]> {
        return this.socketService.on<ReachableTile[]>(Gateway.GAME, GameEvents.PossibleMovement);
    }
}
