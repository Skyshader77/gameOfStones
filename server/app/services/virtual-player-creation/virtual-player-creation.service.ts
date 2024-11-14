import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player, PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { PlayerAttributeType } from '@common/interfaces/stats';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
@Injectable()
export class VirtualPlayerService {
    constructor(
        private playerCreationService: PlayerCreationService,
        private myPlayerService: MyPlayerService,
    ) {}

    createRandomPlayer(role: PlayerRole): Player {
        const newRandomPlayer: PlayerCreationForm = {
            name: this.randomName(),
            avatarId: this.randomAvatar(),
            statsBonus: this.randomStatBonus(),
            dice6: this.randomDice6(),
        };

        return this.playerCreationService.createPlayer(newRandomPlayer, role);
    }

    private randomName(): string {
        const names = ['Alexandre', 'Benjamin', 'Charles-Émile', 'Nabil', 'Nikolai', 'Thierry'];
        return names[Math.floor(Math.random() * names.length)];
    }

    private randomAvatar(): Avatar {
        const avatarKeys = Object.keys(Avatar).filter((key) => isNaN(Number(key)));
        const randomKey = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
        return Avatar[randomKey as keyof typeof Avatar];
    }

    private randomStatBonus(): PlayerAttributeType {
        const stats: PlayerAttributeType[] = [PlayerAttributeType.Hp, PlayerAttributeType.Speed];
        return stats[Math.floor(Math.random() * stats.length)];
    }

    private randomDice6(): PlayerAttributeType {
        const diceTypes: PlayerAttributeType[] = [PlayerAttributeType.Attack, PlayerAttributeType.Defense];
        return diceTypes[Math.floor(Math.random() * diceTypes.length)];
    }

    createRandomPlayers(role: PlayerRole): Player {
        const newRandomPlayer: Player = {
            playerInfo: this.createRandomPlayerInfo(role),
            playerInGame: this.createRandomPlayerInitialInGameState(),
            renderInfo: this.createRandomPlayerInitialRenderInfo(),
        };
        this.myPlayerService.myPlayer = newRandomPlayer;
        return newRandomPlayer;
    }

    private createRandomPlayerInfo(role: PlayerRole): PlayerInfo {
        return {
            id: randomUUID(),
            userName: this.randomName(),
            avatar: this.randomAvatar(),
            role,
        };
    }

    private createRandomPlayerInitialRenderInfo(): PlayerRenderInfo {
        return {
            offset: INITIAL_OFFSET,
            currentSprite: SPRITE_DIRECTION_INDEX[Direction.DOWN],
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
}
