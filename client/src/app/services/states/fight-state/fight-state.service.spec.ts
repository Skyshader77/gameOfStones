import { TestBed } from '@angular/core/testing';

import { FightStateService } from './fight-state.service';
import { MOCK_ATTACK_RESULT, MOCK_WINNING_ATTACK_RESULT, MOCK_FIGHT_RESULT, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { INITIAL_EVADE_COUNT } from '@common/constants/fight.constants';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';

describe('FightStateService', () => {
    let service: FightStateService;
    let playerListService: jasmine.SpyObj<PlayerListService>;

    beforeEach(() => {
        playerListService = jasmine.createSpyObj('PlayerListService', ['getPlayerListCount']);

        playerListService.playerList = MOCK_PLAYERS;

        TestBed.configureTestingModule({
            providers: [FightStateService, { provide: PlayerListService, useValue: playerListService }],
        });
        service = TestBed.inject(FightStateService);
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        service.initializeFight(fightOrder);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the fight with the correct fighters', () => {
        expect(service.currentFight.fighters.length).toBe(2);
        expect(service.currentFight.fighters[0].playerInfo.userName).toBe('Player 1');
        expect(service.currentFight.fighters[1].playerInfo.userName).toBe('Player 2');
    });

    it('should set the currentFighter correctly based on the fighter name', () => {
        service.initializeFightTurn(MOCK_PLAYERS[0].playerInfo.userName);
        expect(service.currentFight.currentFighter).toBe(0);
    });

    it("should reduce the opponent's HP by 1 when attack deals damage", () => {
        const opponent = service.currentFight.fighters[1];
        const remainingHp = service.currentFight.fighters[1].playerInGame.remainingHp;
        service.processAttack(MOCK_ATTACK_RESULT);

        expect(opponent.playerInGame.remainingHp).toBe(remainingHp - 1);
    });

    it('should finish the fight if the attack was the winning blow', () => {
        service.processAttack(MOCK_WINNING_ATTACK_RESULT);
        expect(service.currentFight.isFinished).toBeTrue();
    });

    it('should decrease the number of evasions left for the current fighter', () => {
        expect(service.currentFight.numbEvasionsLeft[0]).toBe(INITIAL_EVADE_COUNT);
        expect(service.currentFight.numbEvasionsLeft[1]).toBe(INITIAL_EVADE_COUNT);
        service.processEvasion(false);
        expect(service.currentFight.numbEvasionsLeft[0]).toBe(INITIAL_EVADE_COUNT - 1);
    });

    it('should finish the fight if the evasion is successful', () => {
        expect(service.currentFight.isFinished).toBeFalse();
        service.processEvasion(true);
        expect(service.currentFight.isFinished).toBeTrue();
    });

    it('should return the number of evasions left for a fighter', () => {
        expect(service.evasionsLeft(service.currentFight.fighters[0].playerInfo.userName)).toBe(INITIAL_EVADE_COUNT);
        service.processEvasion(false);
        expect(service.evasionsLeft(service.currentFight.fighters[0].playerInfo.userName)).toBe(INITIAL_EVADE_COUNT - 1);
    });

    it('should return 0 if the fighter is not found in the fight', () => {
        expect(service.evasionsLeft('')).toBe(0);
    });

    it('should update the winner and loser correctly and reset fight state', () => {
        const winner = service.currentFight.fighters[0];
        const loser = service.currentFight.fighters[1];
        const initialWinnerWinCount = winner.playerInGame.winCount;
        service.processEndFight(MOCK_FIGHT_RESULT);
        expect(winner.playerInGame.winCount).toBe(initialWinnerWinCount + 1);
        expect(loser.playerInGame.currentPosition).toEqual(loser.playerInGame.startPosition);
        expect(loser.playerInGame.remainingHp).toBe(loser.playerInGame.attributes.hp);
        expect(service.currentFight.isFinished).toBeFalse();
        expect(service.currentFight.fighters.length).toBe(0);
    });
});
