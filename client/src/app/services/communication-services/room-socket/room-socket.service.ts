import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { RoomEvents } from '@common/enums/sockets-events/room.events';
import { Map } from '@common/interfaces/map';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Observable } from 'rxjs';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { RoomCreationPayload, RoomJoinPayload } from '@common/interfaces/room-payloads';

@Injectable({
    providedIn: 'root',
})
export class RoomSocketService {
    constructor(private socketService: SocketService) {}

    requestJoinRoom(roomCode: string, player: Player): void {
        if (!roomCode) return;

        const playerSocketIndices: PlayerSocketIndices = {
            room: this.socketService.getSockets.get(Gateway.Room)?.id || '',
            game: this.socketService.getSockets.get(Gateway.Game)?.id || '',
            messaging: this.socketService.getSockets.get(Gateway.Messaging)?.id || '',
            fight: this.socketService.getSockets.get(Gateway.Fight)?.id || '',
        };

        if (playerSocketIndices.room) {
            this.socketService.emit(Gateway.Room, RoomEvents.DesireJoinRoom, { roomCode, playerSocketIndices, player } as RoomJoinPayload);
        }
    }

    createRoom(roomCode: string, map: Map, avatar: Avatar): void {
        this.socketService.emit(Gateway.Room, RoomEvents.Create, { roomCode, map, avatar } as RoomCreationPayload);
    }

    handlePlayerCreationOpened(roomCode: string) {
        this.socketService.emit<string>(Gateway.Room, RoomEvents.PlayerCreationOpened, roomCode);
    }

    leaveRoom(): void {
        this.socketService.emit(Gateway.Room, RoomEvents.Leave);
    }

    addVirtualPlayer(playerRole: PlayerRole): void {
        this.socketService.emit(Gateway.Room, RoomEvents.DesireAddVirtualPlayer, playerRole);
    }

    removePlayer(playerName: string): void {
        this.socketService.emit<string>(Gateway.Room, RoomEvents.DesireKickPlayer, playerName);
    }

    toggleRoomLock(roomId: string): void {
        this.socketService.emit(Gateway.Room, RoomEvents.DesireToggleLock, roomId);
    }

    listenForRoomLocked(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.Room, RoomEvents.RoomLocked);
    }

    listenForRoomJoined(): Observable<Player> {
        return this.socketService.on<Player>(Gateway.Room, RoomEvents.Join);
    }

    listenForJoinError(): Observable<JoinErrors> {
        return this.socketService.on<JoinErrors>(Gateway.Room, RoomEvents.JoinError);
    }

    listenForPlayerLimit(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.Room, RoomEvents.PlayerLimitReached);
    }

    listenForAvatarList(): Observable<boolean[]> {
        return this.socketService.on<boolean[]>(Gateway.Room, RoomEvents.AvailableAvatars);
    }

    listenForAvatarSelected(): Observable<number> {
        return this.socketService.on<number>(Gateway.Room, RoomEvents.AvatarSelected);
    }
}
