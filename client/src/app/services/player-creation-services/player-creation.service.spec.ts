import { TestBed } from '@angular/core/testing';
import { DEFAULT_INITIAL_STAT, INITIAL_OFFSET, INITIAL_POSITION, MAX_INITIAL_STAT, SpriteSheetChoice } from '@app/constants/player.constants';
import { MOCK_PLAYER_FORM_DATA_HP_ATTACK, MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE } from '@app/constants/tests.constants';
import { Player, PlayerInfo, PlayerInGame } from '@app/interfaces/player';
import { AvatarChoice, D6_ATTACK_FIELDS, D6_DEFENCE_FIELDS, PlayerRole } from '@common/constants/player.constants';
import { PlayerCreationService } from './player-creation.service';

describe('PlayerCreationService', () => {
    let service: PlayerCreationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a Player with correct info and stats when HP is selected as the bonus and the D6 is on attack', () => {
        const formData = MOCK_PLAYER_FORM_DATA_HP_ATTACK;

        const result: Player = service.createPlayer(formData, PlayerRole.ORGANIZER);

        const expectedPlayerInfo: Omit<PlayerInfo, 'id'> = {
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role: PlayerRole.ORGANIZER,
        };

        // Willingly ignoring the id field, which is random
        expect(result.playerInfo.userName).toBe(expectedPlayerInfo.userName);
        expect(result.playerInfo.avatar).toBe(expectedPlayerInfo.avatar);
        expect(result.playerInfo.role).toBe(expectedPlayerInfo.role);

        const expectedPlayerInGame: PlayerInGame = {
            hp: MAX_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: DEFAULT_INITIAL_STAT,
            dice: D6_ATTACK_FIELDS,
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
            inventory: [],
            renderInfo: {
                offset: INITIAL_OFFSET,
                currentSprite: 7,
                spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice],
            },
            currentPosition: INITIAL_POSITION,
            hasAbandonned: false,
            startPosition: { x: 0, y: 0 },
            remainingMovement: DEFAULT_INITIAL_STAT,
        };

        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });

    it('should create a Player with correct info and stats when SPEED is selected as the bonus and the D6 is on defense', () => {
        const formData = MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE;

        const result: Player = service.createPlayer(formData, PlayerRole.ORGANIZER);

        const expectedPlayerInfo: Omit<PlayerInfo, 'id'> = {
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role: PlayerRole.ORGANIZER,
        };

        // Willingly ignoring the id field, which is random
        expect(result.playerInfo.userName).toBe(expectedPlayerInfo.userName);
        expect(result.playerInfo.avatar).toBe(expectedPlayerInfo.avatar);
        expect(result.playerInfo.role).toBe(expectedPlayerInfo.role);

        const expectedPlayerInGame: PlayerInGame = {
            hp: DEFAULT_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: MAX_INITIAL_STAT,
            dice: D6_DEFENCE_FIELDS,
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
            inventory: [],
            renderInfo: {
                offset: INITIAL_OFFSET,
                currentSprite: 7,
                spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice],
            },
            currentPosition: INITIAL_POSITION,
            hasAbandonned: false,
            startPosition: { x: 0, y: 0 },
            remainingMovement: MAX_INITIAL_STAT,
        };

        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });
});
