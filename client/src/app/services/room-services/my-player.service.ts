import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { PlayerRole } from '@common/enums/player-role.enum';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;
    role: PlayerRole;
    isCurrentPlayer: boolean;
    isCurrentFighter: boolean;
    isFighting: boolean;

    isOrganizer(): boolean {
        return this.role === PlayerRole.Organizer;
    }

    getUserName(): string {
        return this.myPlayer?.playerInfo.userName;
    }
}
