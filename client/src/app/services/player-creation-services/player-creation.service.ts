import { Injectable } from '@angular/core';
import { DEFAULT_INITIAL_STAT, INITIAL_OFFSET, INITIAL_POSITION, MAX_INITIAL_STAT, SpriteSheetChoice } from '@app/constants/player.constants';
import { Player, PlayerInfo, PlayerInGame } from '@app/interfaces/player';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { Statistic } from '@app/interfaces/stats';
import { AvatarChoice, PlayerRole } from '@common/constants/player.constants';
import { v4 as randomUUID } from 'uuid';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerCreationService {
    constructor(private myPlayerService: MyPlayerService) {}

    createPlayer(formData: PlayerCreationForm, role: PlayerRole): Player {
        const newPlayer: Player = {
            playerInfo: this.createPlayerInfo(formData, role),
            playerInGame: this.createInitialInGameState(formData),
        };
        this.myPlayerService.myPlayer = newPlayer;
        return newPlayer;
    }

    private createPlayerInfo(formData: PlayerCreationForm, role: PlayerRole): PlayerInfo {
        return {
            id: randomUUID(),
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role,
        };
    }

    private createInitialInGameState(formData: PlayerCreationForm): PlayerInGame {
        return {
            hp: formData.statsBonus === Statistic.HP ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: formData.statsBonus === Statistic.SPEED ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            dice:
                formData.dice6 === Statistic.ATTACK
                    ? { defenseDieValue: DEFAULT_INITIAL_STAT, attackDieValue: MAX_INITIAL_STAT }
                    : { defenseDieValue: MAX_INITIAL_STAT, attackDieValue: DEFAULT_INITIAL_STAT },
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
            inventory: [],
            renderInfo: {
                offset: INITIAL_OFFSET,
                currentSprite: 7,
                spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice],
            },
            currentPosition: INITIAL_POSITION,
            startPosition: INITIAL_POSITION,
            hasAbandonned: false,
            remainingMovement: formData.statsBonus === Statistic.SPEED ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
        };
    }
}
