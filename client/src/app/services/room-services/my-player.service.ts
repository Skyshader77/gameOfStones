import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { PlayerRole } from '@common/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;

    isOrganizer(): boolean {
        return this.myPlayer.playerInfo.role === PlayerRole.ORGANIZER;
    }

    getUserName(): string {
        return this.myPlayer.playerInfo.userName;
    }
}
