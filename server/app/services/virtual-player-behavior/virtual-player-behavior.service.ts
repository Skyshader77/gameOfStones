import { Injectable } from '@nestjs/common';

@Injectable()
export class VirtualPlayerBehaviorService {
    // TODO this will require a kind of action queue in the server to execute the correct actions at the
    //      correct time

    createPlayer() {}

    // TODO sets the initial attributes for the turn (when to play and what to do, etc.)
    startTurn() {}
    // TODO every clock tick, this gets called and the actual actions will be done
    updateTurn() {}

    private assignName() {}
    private assignAvatar() {}
    private assignBonus() {}

    // TODO will return a random number of seconds to wait before acting
    private determineTurnTiming() {}
    private determineFightTurnTiming() {}
    // TODO will choose which action is better to do (move, fight, special item)
    private determineTurnAction() {}
    private determineFightAction() {}
}
