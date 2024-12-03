import { TestBed } from '@angular/core/testing';

import {
    DEFAULT_EVASION_COUNT,
    MOCK_ATTACK_RESULT,
    MOCK_FIGHT_RESULT,
    MOCK_PLAYER_INFO,
    MOCK_PLAYERS,
    MOCK_WINNING_ATTACK_RESULT,
} from '@app/constants/tests.constants';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { INITIAL_EVADE_COUNT } from '@common/constants/fight.constants';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { FightStateService } from './fight-state.service';

describe('FightStateService', () => {
    let service: FightStateService;
    let playerListService: jasmine.SpyObj<PlayerListService>;

    beforeEach(() => {
        playerListService = jasmine.createSpyObj('PlayerListService', ['getPlayerListCount']);

        playerListService.playerList = JSON.parse(JSON.stringify(MOCK_PLAYERS));

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

    it('should return true if there is an AggressiveAI in the fight', () => {
        service.currentFight = {
            fighters: [
                {
                    playerInfo: MOCK_PLAYER_INFO[1],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
                {
                    playerInfo: MOCK_PLAYER_INFO[2],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
            ],
            result: { winner: null, loser: null, respawnPosition: { x: 0, y: 0 } },
            currentFighter: 0,
            numbEvasionsLeft: [DEFAULT_EVASION_COUNT, DEFAULT_EVASION_COUNT],
            isFinished: false,
        };

        expect(service.isAIInFight()).toBeTrue();
    });

    it('should return true if there is a DefensiveAI in the fight', () => {
        service.currentFight = {
            fighters: [
                {
                    playerInfo: MOCK_PLAYER_INFO[1],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
                {
                    playerInfo: MOCK_PLAYER_INFO[3],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
            ],
            result: { winner: null, loser: null, respawnPosition: { x: 0, y: 0 } },
            currentFighter: 0,
            numbEvasionsLeft: [DEFAULT_EVASION_COUNT, DEFAULT_EVASION_COUNT],
            isFinished: false,
        };

        expect(service.isAIInFight()).toBeTrue();
    });

    it('should return false if there are no AIs in the fight', () => {
        service.currentFight = {
            fighters: [
                {
                    playerInfo: MOCK_PLAYER_INFO[2],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
                {
                    playerInfo: MOCK_PLAYER_INFO[0],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
            ],
            result: { winner: null, loser: null, respawnPosition: { x: 0, y: 0 } },
            currentFighter: 0,
            numbEvasionsLeft: [DEFAULT_EVASION_COUNT, DEFAULT_EVASION_COUNT],
            isFinished: false,
        };

        expect(service.isAIInFight()).toBeFalse();
    });

    it('should return true if there is both an AggressiveAI and DefensiveAI in the fight', () => {
        service.currentFight = {
            fighters: [
                {
                    playerInfo: MOCK_PLAYER_INFO[1],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
                {
                    playerInfo: MOCK_PLAYER_INFO[3],
                    playerInGame: MOCK_PLAYER_IN_GAME,
                },
            ],
            result: { winner: null, loser: null, respawnPosition: { x: 0, y: 0 } },
            currentFighter: 0,
            numbEvasionsLeft: [DEFAULT_EVASION_COUNT, DEFAULT_EVASION_COUNT],
            isFinished: false,
        };

        expect(service.isAIInFight()).toBeTrue();
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
