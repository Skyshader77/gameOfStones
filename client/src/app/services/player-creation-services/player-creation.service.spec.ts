import { TestBed } from '@angular/core/testing';
import { PlayerCreationService } from './player-creation.service';
import {
    AvatarChoice,
    DEFAULT_INITIAL_STAT,
    INITIAL_OFFSET,
    INITIAL_POSITION,
    MAX_INITIAL_STAT,
    MAX_VALUE_D4,
    MAX_VALUE_D6,
    SpriteSheetChoice,
} from '@app/constants/player.constants';
import { PlayerRole } from '@common/interfaces/player.constants';
import { Player, PlayerInfo, PlayerInGame } from '@app/interfaces/player';
import { MOCK_PLAYER_FORM_DATA_HP_ATTACK, MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE } from '@app/constants/tests.constants';

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

        const expectedPlayerInfo: PlayerInfo = {
            id: '1',
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role: PlayerRole.ORGANIZER,
        };
        expect(result.playerInfo).toEqual(expectedPlayerInfo);

        const expectedPlayerInGame: PlayerInGame = {
            hp: MAX_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: DEFAULT_INITIAL_STAT,
            dice: { defenseDieValue: MAX_VALUE_D4, attackDieValue: MAX_VALUE_D6 },
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
            inventory: [],
            renderInfo: {
                offset: INITIAL_OFFSET,
                spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice],
            },
            currentPosition: INITIAL_POSITION,
            hasAbandonned: false,
        };
        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });

    it('should create a Player with correct info and stats when SPEED is selected as the bonus and the D6 is on defense', () => {
        const formData = MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE;

        const result: Player = service.createPlayer(formData, PlayerRole.ORGANIZER);

        const expectedPlayerInfo: PlayerInfo = {
            id: '1',
            userName: formData.name,
            avatar: AvatarChoice[`AVATAR${formData.avatarId}` as keyof typeof AvatarChoice],
            role: PlayerRole.ORGANIZER,
        };
        expect(result.playerInfo).toEqual(expectedPlayerInfo);

        const expectedPlayerInGame: PlayerInGame = {
            hp: DEFAULT_INITIAL_STAT,
            isCurrentPlayer: false,
            isFighting: false,
            movementSpeed: MAX_INITIAL_STAT,
            dice: { defenseDieValue: MAX_VALUE_D6, attackDieValue: MAX_VALUE_D4 },
            attack: DEFAULT_INITIAL_STAT,
            defense: DEFAULT_INITIAL_STAT,
            inventory: [],
            renderInfo: {
                offset: INITIAL_OFFSET,
                spriteSheet: SpriteSheetChoice[`SPRITE${formData.avatarId}` as keyof typeof SpriteSheetChoice],
            },
            currentPosition: INITIAL_POSITION,
            hasAbandonned: false,
        };
        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });
});
