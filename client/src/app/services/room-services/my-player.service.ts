import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;
}
