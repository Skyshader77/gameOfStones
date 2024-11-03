import { TestBed } from '@angular/core/testing';
import { DEFAULT_INITIAL_STAT, MAX_INITIAL_STAT } from '@app/constants/player.constants';
import { MOCK_PLAYER_FORM_DATA_HP_ATTACK, MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE } from '@app/constants/tests.constants';
import { PlayerCreationService } from './player-creation.service';
import { PlayerRole } from '@common/enums/player-role.enum';
import { PlayerInfo, PlayerInGame } from '@common/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { Player } from '@app/interfaces/player';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { ATTACK_DICE, DEFENSE_DICE } from '@common/interfaces/dice';

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

        const result: Player = service.createPlayer(formData, PlayerRole.Organizer);

        const expectedPlayerInfo: Omit<PlayerInfo, 'id'> = {
            userName: formData.name,
            avatar: formData.avatarId as Avatar,
            role: PlayerRole.Organizer,
        };

        // Willingly ignoring the id field, which is random
        expect(result.playerInfo.userName).toBe(expectedPlayerInfo.userName);
        expect(result.playerInfo.avatar).toBe(expectedPlayerInfo.avatar);
        expect(result.playerInfo.role).toBe(expectedPlayerInfo.role);

        const expectedPlayerInGame: PlayerInGame = {
            ...MOCK_PLAYER_IN_GAME,
            attributes: {
                hp: MAX_INITIAL_STAT,
                speed: DEFAULT_INITIAL_STAT,
                attack: DEFAULT_INITIAL_STAT,
                defense: DEFAULT_INITIAL_STAT,
            },
            dice: ATTACK_DICE,
            remainingMovement: DEFAULT_INITIAL_STAT,
        };

        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });

    it('should create a Player with correct info and stats when SPEED is selected as the bonus and the D6 is on defense', () => {
        const formData = MOCK_PLAYER_FORM_DATA_SPEED_DEFENSE;

        const result: Player = service.createPlayer(formData, PlayerRole.Organizer);

        const expectedPlayerInfo: Omit<PlayerInfo, 'id'> = {
            userName: formData.name,
            avatar: formData.avatarId as Avatar,
            role: PlayerRole.Organizer,
        };

        // Willingly ignoring the id field, which is random
        expect(result.playerInfo.userName).toBe(expectedPlayerInfo.userName);
        expect(result.playerInfo.avatar).toBe(expectedPlayerInfo.avatar);
        expect(result.playerInfo.role).toBe(expectedPlayerInfo.role);

        const expectedPlayerInGame: PlayerInGame = {
            ...MOCK_PLAYER_IN_GAME,
            attributes: {
                hp: DEFAULT_INITIAL_STAT,
                speed: MAX_INITIAL_STAT,
                attack: DEFAULT_INITIAL_STAT,
                defense: DEFAULT_INITIAL_STAT,
            },
            dice: DEFENSE_DICE,
        };

        expect(result.playerInGame).toEqual(expectedPlayerInGame);
    });
});
