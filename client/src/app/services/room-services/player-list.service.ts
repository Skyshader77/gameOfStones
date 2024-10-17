import { Injectable } from '@angular/core';
import { Player, PlayerInfo } from '@app/interfaces/player';
import { SocketService } from '../communication-services/socket.service';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: PlayerInfo[];

    constructor(private socketService: SocketService) {}

    fetchPlayers(roomId: string): void {
        this.socketService.emit(SocketRole.ROOM, RoomEvents.FETCH_PLAYERS, { roomId });

        const playerListObserver: Observer<Player[]> = {
            next: (players) => {
                this.playerList = players.map((player) => player.playerInfo);
            },
            error: (error) => {},
            complete: () => {},
        };

        this.socketService.on<Player[]>(SocketRole.ROOM, RoomEvents.PLAYER_LIST).subscribe(playerListObserver);
    }
}
