import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Map } from '@common/interfaces/map';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

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
            messaging: this.socketService.getSockets.get(Gateway.MESSAGING)?.id || '',
        };

        if (playerSocketIndices.room) {
            this.socketService.emit(Gateway.ROOM, RoomEvents.DesireJoinRoom, { roomId, playerSocketIndices, player });
        }
    }

    createRoom(roomCode: string, map: Map, avatar: Avatar): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.Create, { roomCode, map, avatar });
    }

    handlePlayerCreationOpened(roomCode: string) {
        this.socketService.emit<string>(Gateway.ROOM, RoomEvents.PlayerCreationOpened, roomCode);
    }

    leaveRoom(): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.Leave);
    }

    addVirtualPlayer(player: Player): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.AddPlayer, player); // Emit un event pour ajouter un joueur virtuel
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
