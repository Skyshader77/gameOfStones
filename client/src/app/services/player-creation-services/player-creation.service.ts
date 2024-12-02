import { Injectable } from '@angular/core';
import { INITIAL_OFFSET, SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { Player, PlayerRenderInfo } from '@app/interfaces/player';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { PlayerAttributeType } from '@app/interfaces/stats';
import { DEFAULT_INITIAL_STAT, INITIAL_POSITION, MAX_INITIAL_STAT } from '@common/constants/player-creation.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { ATTACK_DICE, DEFENSE_DICE } from '@common/constants/dice.constants';
import { Direction } from '@common/interfaces/move';
import { PlayerAttributes, PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { v4 as randomUUID } from 'uuid';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

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

    createInitialRenderInfo(): PlayerRenderInfo {
        return {
            offset: JSON.parse(JSON.stringify(INITIAL_OFFSET)),
            angle: 0,
            currentStep: 1,
            currentSprite: SPRITE_DIRECTION_INDEX[Direction.DOWN],
        };
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
        const baseAttributes: PlayerAttributes = {
            hp: formData.statsBonus === PlayerAttributeType.Hp ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            speed: formData.statsBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
        };

        return {
            baseAttributes: JSON.parse(JSON.stringify(baseAttributes)) as PlayerAttributes,
            attributes: baseAttributes,
            dice: formData.dice6 === PlayerAttributeType.Attack ? ATTACK_DICE : DEFENSE_DICE,
            inventory: [],
            winCount: 0,
            currentPosition: { x: INITIAL_POSITION.x, y: INITIAL_POSITION.y },
            startPosition: { x: INITIAL_POSITION.x, y: INITIAL_POSITION.y },
            hasAbandoned: false,
            remainingMovement: formData.statsBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            remainingHp: formData.statsBonus === PlayerAttributeType.Hp ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            remainingActions: 1,
        };
    }
}
