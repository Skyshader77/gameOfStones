import { MAX_AI_ACTION_DELAY, MIN_AI_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { isPlayerHuman } from '@app/utils/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { DEFENSIVE_ITEMS } from '@common/enums/item-type.enum';

@Injectable()
export class VirtualPlayerHelperService {
    @Inject() private fightLogicService: FightLogicService;

    getRandomAIActionInterval() {
        return Math.floor(Math.random() * (MAX_AI_ACTION_DELAY - MIN_AI_ACTION_DELAY)) + MIN_AI_ACTION_DELAY;
    }

    isCurrentFighterAI(room: RoomGame, playerName: string): boolean {
        if (!room.game.fight) {
            return false;
        }
        return (
            !this.fightLogicService.isCurrentFighter(room.game.fight, playerName) &&
            room.game.fight.fighters.some((fighter) => !isPlayerHuman(fighter))
        );
    }

    areTwoAIsFighting(room: RoomGame): boolean {
        if (!room.game.fight) {
            return false;
        }
        return !room.game.fight.fighters.some((fighter) => isPlayerHuman(fighter));
    }

    determineAIBattleWinner(): { loserIndex: number; winnerIndex: number } {
        const loserIndex = Math.floor(Math.random() * 2);
        const winnerIndex = (loserIndex + 1) % 2;

        return { loserIndex, winnerIndex };
    }

    remainingDefensiveItemCount(room: RoomGame) {
        return room.game.map.placedItems.filter((item) => DEFENSIVE_ITEMS.includes(item.type)).length;
    }
}
