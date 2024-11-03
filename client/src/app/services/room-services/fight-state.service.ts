import { Injectable } from '@angular/core';
import { Fight } from '@common/interfaces/fight';

@Injectable({
    providedIn: 'root',
})
export class FightStateService {
    currentFight: Fight = {
        fighters: [],
        currentFighter: 0,
        hasPendingAction: false,
        numbEvasionsLeft: [],
        winner: '',
        loser: '',
        isFinished: false,
    };
    currentFighter: string;
}
