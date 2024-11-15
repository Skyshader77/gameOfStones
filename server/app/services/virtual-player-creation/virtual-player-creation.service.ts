import { RoomGame } from '@app/interfaces/room-game';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { DEFAULT_INITIAL_STAT, INITIAL_POSITION, MAX_INITIAL_STAT } from '@common/constants/player-creation.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { ATTACK_DICE, DEFENSE_DICE } from '@common/interfaces/dice';
import { Player, PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { PlayerAttributeType } from '@common/interfaces/stats';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
@Injectable()
export class VirtualPlayerCreationService {
    constructor(
        private roomManagerService: RoomManagerService,
        private avatarManagerService: AvatarManagerService,
        private logger: Logger,
    ) {}

    createVirtualPlayer(room: RoomGame, role: PlayerRole): Player {
        const newVirtualPlayer: Player = {
            playerInfo: this.createRandomPlayerInfo(room, role),
            playerInGame: this.createRandomPlayerInitialInGameState(),
        };

        return newVirtualPlayer;
    }

    private createRandomPlayerInfo(room: RoomGame, role: PlayerRole): PlayerInfo {
        return {
            id: randomUUID(),
            userName: this.randomName(room),
            avatar: this.randomAvatar(room),
            role,
        };
    }

    private createRandomPlayerInitialInGameState(): PlayerInGame {
        const randomBonus = this.randomStatBonus();
        const randomDice = this.randomDice6();

        return {
            attributes: {
                hp: randomBonus === PlayerAttributeType.Hp ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
                speed: randomBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
                attack: DEFAULT_INITIAL_STAT,
                defense: DEFAULT_INITIAL_STAT,
            },
            dice: randomDice === PlayerAttributeType.Attack ? ATTACK_DICE : DEFENSE_DICE,
            inventory: [],
            winCount: 0,
            currentPosition: { x: INITIAL_POSITION.x, y: INITIAL_POSITION.y },
            startPosition: { x: INITIAL_POSITION.x, y: INITIAL_POSITION.y },
            hasAbandoned: false,
            remainingMovement: randomBonus === PlayerAttributeType.Speed ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            remainingHp: randomBonus === PlayerAttributeType.Hp ? MAX_INITIAL_STAT : DEFAULT_INITIAL_STAT,
            remainingActions: 1,
        };
    }

    private randomName(room: RoomGame): string {
        const names = ['Alexandre', 'Benjamin', 'Charles-Émile', 'Nabil', 'Nikolai', 'Thierry'];
        let selectedName: string = names[Math.floor(Math.random() * names.length)];
        while (!this.roomManagerService.checkIfNameIsUnique(room, selectedName)) {
            selectedName = names[Math.floor(Math.random() * names.length)];
        }
        return selectedName;
    }

    private randomAvatar(room: RoomGame): Avatar {
        const avatarKey = this.avatarManagerService.getVirtualPlayerStartingAvatar(room.room.roomCode);
        return avatarKey as Avatar;
    }

    private randomStatBonus(): PlayerAttributeType {
        const stats: PlayerAttributeType[] = [PlayerAttributeType.Hp, PlayerAttributeType.Speed];
        return stats[Math.floor(Math.random() * stats.length)];
    }

    private randomDice6(): PlayerAttributeType {
        const diceTypes: PlayerAttributeType[] = [PlayerAttributeType.Attack, PlayerAttributeType.Defense];
        return diceTypes[Math.floor(Math.random() * diceTypes.length)];
    }
}
