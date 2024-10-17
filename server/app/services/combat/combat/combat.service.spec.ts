import { MOCK_FIGHT, MOCK_GAME, MOCK_PLAYER_ONE, MOCK_PLAYER_TWO } from '@app/constants/combat.test.constants';
import { CombatService } from './combat.service';

describe('CombatService', () => {
    let combatService: CombatService;

    beforeEach(() => {
        combatService = new CombatService();
        combatService.initializeCombat(MOCK_FIGHT, MOCK_GAME);
    });

    it('should initialize combat with players and game', () => {
        expect(combatService.playerOne).toBe(MOCK_PLAYER_ONE);
        expect(combatService.playerTwo).toBe(MOCK_PLAYER_TWO);
        expect(combatService.hasFightEnded).toBe(false);
    });

    it('should determine who goes first based on movement speed', () => {
        const firstPlayer = combatService.determineWhoGoesFirst();
        expect(firstPlayer).toBe(MOCK_PLAYER_ONE.id);
    });

    it('should swap player turns', () => {
        combatService.swapPlayerTurn();
        expect(combatService.playerOne).toBe(MOCK_PLAYER_TWO);
        expect(combatService.playerTwo).toBe(MOCK_PLAYER_ONE);
    });

    it('should perform an attack and reduce HP', () => {
        const wasHpLostSpy = jest.spyOn(combatService, 'WasHpLost').mockReturnValue(true);
        const attackResult = combatService.performAttack(MOCK_PLAYER_ONE.id);

        expect(attackResult.playerId).toBe(MOCK_PLAYER_TWO.id);
        expect(attackResult.remainingHp).toBe(7);
        expect(attackResult.hasFightEnded).toBe(false);
        expect(wasHpLostSpy).toHaveBeenCalledTimes(1);

        wasHpLostSpy.mockRestore();
    });

    it('should end the fight if a player reaches 0 HP', () => {
        const wasHpLostSpy = jest.spyOn(combatService, 'WasHpLost').mockReturnValue(true);
        MOCK_PLAYER_TWO.playerInGame.hp = 1;

        const attackResult = combatService.performAttack(MOCK_PLAYER_ONE.id);

        expect(attackResult.hasFightEnded).toBe(true);
        expect(combatService.hasFightEnded).toBe(true);
        expect(wasHpLostSpy).toHaveBeenCalledTimes(1);

        wasHpLostSpy.mockRestore();
    });

    it('should let a player escape if the player has sufficient number of evasion attempts', () => {
        const hasPlayerEscapedSpy = jest.spyOn(combatService, 'hasPlayerEscaped').mockReturnValue(true);
        const hasEscaped = combatService.hasPerformedEscape(MOCK_PLAYER_ONE.id);

        expect(hasEscaped).toBe(true);
        expect(combatService.hasFightEnded).toBe(true);
        expect(hasPlayerEscapedSpy).toHaveBeenCalledTimes(1);

        hasPlayerEscapedSpy.mockRestore();
    });

    it('should reduce number of evasions if the player has not escaped', () => {
        const hasPlayerEscapedSpy = jest.spyOn(combatService, 'hasPlayerEscaped').mockReturnValue(false);
        combatService.hasPerformedEscape(MOCK_PLAYER_ONE.id);

        expect(combatService.fight.numbEvasionsLeft[0]).toBe(1);
        expect(combatService.hasFightEnded).toBe(false);
        expect(hasPlayerEscapedSpy).toHaveBeenCalledTimes(1);

        hasPlayerEscapedSpy.mockRestore();
    });
});