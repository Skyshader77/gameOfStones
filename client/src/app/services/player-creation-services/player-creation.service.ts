import { Injectable } from '@angular/core';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { PlayerAttributeType } from '@app/interfaces/stats';
import { v4 as randomUUID } from 'uuid';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { Direction } from '@common/interfaces/move';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player, PlayerRenderInfo } from '@app/interfaces/player';
import { PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { DEFAULT_INITIAL_STAT, INITIAL_OFFSET, INITIAL_POSITION, MAX_INITIAL_STAT, SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class PlayerCreationService {
    constructor(private myPlayerService: MyPlayerService) {}

    createPlayer(formData: PlayerCreationForm, role: PlayerRole): Player {
        const newPlayer: Player = {
            playerInfo: this.createPlayerInfo(formData, role),
            playerInGame: this.createInitialInGameState(formData),
            renderInfo: this.createInitialRenderInfo(),
        };
        this.myPlayerService.myPlayer = newPlayer;
        return newPlayer;
    }

    private createPlayerInfo(formData: PlayerCreationForm, role: PlayerRole): PlayerInfo {
        return {
            id: randomUUID(),
            userName: formData.name,
            avatar: formData.avatarId as Avatar,
            role,
        };
    }

    private createInitialInGameState(formData: PlayerCreationForm): PlayerInGame {
        return {
            attributes: {
                hp: formData.statsBonus === PlayerAttributeType.Hp ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
                speed: formData.statsBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
                attack: DEFAULT_INITIAL_STAT,
                defense: DEFAULT_INITIAL_STAT,
            },
            dice:
                formData.dice6 === PlayerAttributeType.Attack
                    ? { defenseDieValue: DEFAULT_INITIAL_STAT, attackDieValue: MAX_INITIAL_STAT }
                    : { defenseDieValue: MAX_INITIAL_STAT, attackDieValue: DEFAULT_INITIAL_STAT },
            inventory: [],
            winCount: 0,
            currentPosition: INITIAL_POSITION,
            startPosition: INITIAL_POSITION,
            hasAbandoned: false,
            remainingMovement: formData.statsBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            remainingActions: 1,
        };
    }

    private createInitialRenderInfo(): PlayerRenderInfo {
        return {
            offset: INITIAL_OFFSET,
            currentSprite: SPRITE_DIRECTION_INDEX[Direction.DOWN],
        };
    }
}
