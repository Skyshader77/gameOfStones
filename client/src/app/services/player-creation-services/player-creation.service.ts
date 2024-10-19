import { Injectable } from '@angular/core';
import {
    AvatarChoice,
    DEFAULT_INITIAL_STAT,
    INITIAL_OFFSET,
    INITIAL_POSITION,
    MAX_INITIAL_STAT,
    SpriteSheetChoice,
} from '@app/constants/player.constants';
import { Player, PlayerInfo, PlayerInGame } from '@app/interfaces/player';
import { Statistic } from '@app/interfaces/stats';
import { PlayerRole } from '@common/interfaces/player.constants';

@Injectable({
    providedIn: 'root',
})
export class PlayerCreationService {
    createPlayer(formData: { name: string; avatarId: number; statsBonus: Statistic; dice6: Statistic }, role: PlayerRole): Player {
        const newPlayer: Player = {
            playerInfo: this.createPlayerInfo(formData, role),
            playerInGame: this.createInitialInGameState(formData),
        };
        return newPlayer;
    }

    private createPlayerInfo(formData: { name: string; avatarId: number }, role: PlayerRole): PlayerInfo {
        return {
            id: '1',
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role,
        };
    }

    private createInitialInGameState(formData: { avatarId: number; statsBonus: Statistic; dice6: Statistic }): PlayerInGame {
        return {
            hp: formData.statsBonus === Statistic.HP ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: formData.statsBonus === Statistic.SPEED ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            dice: formData.dice6 === Statistic.ATTACK ? { defenseDieValue: 4, attackDieValue: 6 } : { defenseDieValue: 6, attackDieValue: 4 },
            attack: 4,
            defense: 4,
            inventory: [],
            renderInfo: { offset: INITIAL_OFFSET, spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice] },
            currentPosition: INITIAL_POSITION,
            hasAbandonned: false,
        };
    }
}
