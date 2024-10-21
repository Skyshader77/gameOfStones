import { Injectable } from '@angular/core';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { Player, PlayerInfo } from '@app/interfaces/player';
import { SocketService } from '@app/services/communication-services/socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: PlayerInfo[];

    constructor(private socketService: SocketService) {
        this.socketService.on<Player[]>(SocketRole.ROOM, RoomEvents.PLAYER_LIST).subscribe((players) => {
            this.playerList = players.map((player) => player.playerInfo);
        });
    }

    fetchPlayers(roomId: string): void {
        this.socketService.emit(SocketRole.ROOM, RoomEvents.FETCH_PLAYERS, { roomId });
    }

    removePlayer(id: string): void {
        this.playerList = this.playerList.filter((player) => player.id !== id);
    }
}
