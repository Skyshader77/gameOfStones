import { Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { Player } from '@app/interfaces/player';
import { Gateway } from '@common/constants/gateway.constants';
import { JoinErrors } from '@common/interfaces/join-errors';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';
import { AvatarChoice } from '@common/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class RoomSocketService {
    constructor(private socketService: SocketService) {}

    requestJoinRoom(roomId: string, player: Player): void {
        if (!roomId) return;

        const playerSocketIndices: PlayerSocketIndices = {
            room: this.socketService.getSockets.get(Gateway.ROOM)?.id || '',
            game: this.socketService.getSockets.get(Gateway.GAME)?.id || '',
            chat: this.socketService.getSockets.get(Gateway.CHAT)?.id || '',
        };

        if (playerSocketIndices.room) {
            this.socketService.emit(Gateway.ROOM, RoomEvents.DesireJoinRoom, { roomId, playerSocketIndices, player });
        }
    }

    createRoom(roomId: string, map: Map, avatar: AvatarChoice): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.Create, { roomId, map, avatar });
    }

    handlePlayerCreationOpened(roomCode: string) {
        this.socketService.emit<string>(Gateway.ROOM, RoomEvents.PlayerCreationOpened, roomCode);
    }

    leaveRoom(): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.Leave);
    }

    removePlayer(playerName: string): void {
        this.socketService.emit<string>(Gateway.ROOM, RoomEvents.DesireKickPlayer, playerName);
    }

    toggleRoomLock(roomId: string): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.DesireToggleLock, { roomId });
    }

    listenForRoomLocked(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.ROOM, RoomEvents.RoomLocked);
    }

    listenForRoomJoined(): Observable<Player> {
        return this.socketService.on<Player>(Gateway.ROOM, RoomEvents.Join);
    }

    listenForJoinError(): Observable<JoinErrors> {
        return this.socketService.on<JoinErrors>(Gateway.ROOM, RoomEvents.JoinError);
    }

    listenForPlayerLimit(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.ROOM, RoomEvents.PlayerLimitReached);
    }

    listenForAvatarList(): Observable<boolean[]> {
        return this.socketService.on<boolean[]>(Gateway.ROOM, RoomEvents.AvailableAvatars);
    }

    listenForAvatarSelected(): Observable<number> {
        return this.socketService.on<number>(Gateway.ROOM, RoomEvents.AvatarSelected);
    }
}
