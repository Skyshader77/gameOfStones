import * as constants from '@app/constants/journal.constants';
import { MOCK_FIGHT, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { AttackResult } from '@common/interfaces/fight';
import { JournalLog } from '@common/interfaces/message';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { JournalManagerService } from './journal-manager.service';

describe('JournalManagerService', () => {
    let service: JournalManagerService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let mockRoom: RoomGame;

    let playerName1: string = '';
    let playerName2: string = '';

    beforeEach(async () => {
        roomManagerService = createStubInstance(RoomManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JournalManagerService,
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
            ],
        }).compile();

        service = module.get<JournalManagerService>(JournalManagerService);

        mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        playerName1 = mockRoom.players[0].playerInfo.userName;
        playerName2 = mockRoom.players[1].playerInfo.userName;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add a journal entry to a room', () => {
        const log: JournalLog = {
            message: { content: 'Test Log', time: new Date() },
            entry: JournalEntry.TurnStart,
            players: [playerName1],
        };
        roomManagerService.getRoom.returns(mockRoom);

        service.addJournalToRoom(log, 'roomCode');

        expect(roomManagerService.getRoom.calledWith('roomCode')).toBe(true);
        expect(mockRoom.journal).toContain(log);
    });

    it('should generate a TurnStart journal entry', () => {
        const log = service.generateJournal(JournalEntry.TurnStart, mockRoom);
        expect(log.message.content).toContain(constants.TURN_START_LOG + playerName1);
        expect(log.entry).toEqual(JournalEntry.TurnStart);
    });

    it('should generate a DoorOpen journal entry', () => {
        const log = service.generateJournal(JournalEntry.DoorOpen, mockRoom);
        expect(log.message.content).toContain(playerName1 + constants.OPEN_DOOR_LOG);
        expect(log.entry).toEqual(JournalEntry.DoorOpen);
    });

    it('should generate a FightStart journal entry', () => {
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        const log = service.generateJournal(JournalEntry.FightStart, mockRoom);
        expect(log.message.content).toContain(playerName1 + constants.START_FIGHT_LOG + playerName2);
        expect(log.entry).toEqual(JournalEntry.FightStart);
    });

    it('should generate a FightAttack journal entry', () => {
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        const log = service.generateJournal(JournalEntry.FightAttack, mockRoom);

        const attacker = mockRoom.game.fight.fighters[0].playerInfo.userName;
        const defender = mockRoom.game.fight.fighters[1].playerInfo.userName;
        const expectedContent = attacker + constants.ATTACK_LOG + defender;

        expect(log.message.content).toEqual(expectedContent);
        expect(log.entry).toEqual(JournalEntry.FightAttack);
        expect(log.players).toEqual([attacker, defender]);
    });

    it('should generate a FightEvade journal entry', () => {
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        const log = service.generateJournal(JournalEntry.FightEvade, mockRoom);

        const evader = mockRoom.game.fight.fighters[0].playerInfo.userName;
        const expectedContent = evader + constants.EVASION_LOG;

        expect(log.message.content).toEqual(expectedContent);
        expect(log.entry).toEqual(JournalEntry.FightAttack); // Intentional reuse in FightEvadeJournal
        expect(log.players).toEqual([evader]);
    });

    it('should generate a FightEnd journal entry when there is a winner', () => {
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        mockRoom.game.fight.result = { winner: playerName1, loser: playerName2 };

        const log = service.generateJournal(JournalEntry.FightEnd, mockRoom);
        const expectedContent = playerName1 + constants.FIGHT_WINNER_LOG + playerName2;

        expect(log.message.content).toEqual(expectedContent);
        expect(log.entry).toEqual(JournalEntry.FightStart);
        expect(log.players).toEqual([playerName1, playerName2]);
    });

    it('should generate a FightEnd journal entry when there is no winner', () => {
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));

        const log = service.generateJournal(JournalEntry.FightEnd, mockRoom);
        const fighter1 = mockRoom.game.fight.fighters[0].playerInfo.userName;
        const fighter2 = mockRoom.game.fight.fighters[1].playerInfo.userName;
        const expectedContent = fighter1 + constants.AND + fighter2 + constants.FIGHT_NO_WINNER_LOG;

        expect(log.message.content).toEqual(expectedContent);
        expect(log.entry).toEqual(JournalEntry.FightStart);
        expect(log.players).toEqual([fighter1, fighter2]);
    });

    it('should generate a FightAttackResult journal entry', () => {
        const attackResult: AttackResult = { attackRoll: 5, defenseRoll: 3, hasDealtDamage: true, wasWinningBlow: false };
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        const log = service.fightAttackResultJournal(mockRoom, attackResult);

        expect(log.message.content).toContain(constants.ATTACK_DICE_LOG + '5' + constants.DEFENSE_DICE_LOG + '3');
        expect(log.entry).toEqual(JournalEntry.FightAttackResult);
    });

    it('should generate a FightEvadeResult journal entry', () => {
        const evadingPlayer = playerName1;
        mockRoom.game.fight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        const log = service.fightEvadeResultJournal(mockRoom, true);
        expect(log.message.content).toContain(evadingPlayer + constants.SUCCESS_EVASION_LOG);
        expect(log.entry).toEqual(JournalEntry.FightEvadeResult);
    });

    it('should generate a PlayerAbandon journal entry', () => {
        const abandoningPlayerName = playerName1;
        const log = service.abandonJournal(abandoningPlayerName);
        expect(log.message.content).toContain(abandoningPlayerName + constants.ABANDON_LOG);
        expect(log.entry).toEqual(JournalEntry.PlayerAbandon);
    });

    it('should generate a PlayerWin journal entry', () => {
        const winnerName = playerName1;
        mockRoom.game.winner = winnerName;
        const log = service.generateJournal(JournalEntry.PlayerWin, mockRoom);
        expect(log.message.content).toContain(winnerName + constants.WINNER_LOG);
        expect(log.entry).toEqual(JournalEntry.PlayerWin);
    });

    it('should generate a GameEnd journal entry', () => {
        const log = service.generateJournal(JournalEntry.GameEnd, mockRoom);
        expect(log.message.content).toContain(playerName1 + constants.AND + playerName2 + constants.GAME_END_LOG);
        expect(log.entry).toEqual(JournalEntry.PlayerWin);
    });

    it('should generate a DoorClose journal entry', () => {
        const log = service.generateJournal(JournalEntry.DoorClose, mockRoom);
        expect(log.message.content).toContain(playerName1 + constants.CLOSED_DOOR_LOG);
        expect(log.entry).toEqual(JournalEntry.DoorClose);
        expect(log.players).toEqual([playerName1]);
    });

    it('should return null for an invalid journalEntry', () => {
        const invalidEntry = 'InvalidEntry' as unknown as JournalEntry;
        const log = service.generateJournal(invalidEntry, mockRoom);

        expect(log).toBeNull();
    });
});
