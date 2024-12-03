import { Test, TestingModule } from '@nestjs/testing';
import { GameStatsService } from './game-stats.service';
import { GameStats, PlayerStats } from '@app/interfaces/statistics';
import { MOCK_MAPS, MOCK_PLAYERS } from '@app/constants/test.constants';
import { Player } from '@common/interfaces/player';
import { ItemType } from '@common/enums/item-type.enum';
import { MOCK_GAME_STATS, MOCK_PLAYER_STATS } from '@app/constants/test-stats.constants';
import { FightResult } from '@common/interfaces/fight';
import { Map as GameMap } from '@common/interfaces/map';

describe('GameStatsService', () => {
    let service: GameStatsService;
    let mockGameStats: GameStats;
    let mockMap: GameMap;
    let mockPlayers: Player[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameStatsService],
        }).compile();

        service = module.get<GameStatsService>(GameStatsService);
        mockGameStats = JSON.parse(JSON.stringify(MOCK_GAME_STATS)) as GameStats;
        mockPlayers = MOCK_PLAYERS;
        mockMap = MOCK_MAPS[0];
        mockGameStats.playerStats = new Map<string, PlayerStats>();
        mockGameStats.playerStats.set(MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYER_STATS);
        mockGameStats.playerStats.set(MOCK_PLAYERS[1].playerInfo.userName, MOCK_PLAYER_STATS);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize game start stats correctly', () => {
        const stats = service.getGameStartStats(mockMap, mockPlayers);
        expect(stats.startTime).toBeDefined();
        expect(stats.turnCount).toEqual(0);
        expect(stats.doorCount).toBeGreaterThan(0);
        expect(stats.walkableTilesCount).toBeGreaterThan(0);
        expect(stats.visitedTiles.length).toEqual(mockMap.size);
        expect(stats.playerStats.size).toEqual(mockPlayers.length);
    });

    it('should calculate game end stats correctly', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:01:00Z').getTime());
        mockGameStats.startTime = new Date('2023-01-01T00:00:00Z');
        const endStats = service.getGameEndStats(mockGameStats, mockPlayers);
        expect(endStats.timeTaken).toEqual(60);
        expect(endStats.turnCount).toEqual(mockGameStats.turnCount);
        expect(endStats.percentageDoorsUsed).toEqual(0);
        expect(endStats.playerStats).toHaveLength(mockPlayers.length);
        jest.useRealTimers();
    });

    it('should increment turn count', () => {
        service.processTurnStats(mockGameStats);
        expect(mockGameStats.turnCount).toEqual(1);
    });

    it('should process movement stats correctly', () => {
        const player = mockPlayers[0];
        service.processMovementStats(mockGameStats, player);
        const position = player.playerInGame.currentPosition;
        expect(mockGameStats.visitedTiles[position.y][position.x]).toBe(true);
    });

    it('should process door toggle stats', () => {
        const doorPosition = { x: 1, y: 1 };
        service.processDoorToggleStats(mockGameStats, doorPosition);
        expect(mockGameStats.interactedDoors).toContainEqual(doorPosition);

        service.processDoorToggleStats(mockGameStats, doorPosition);
        expect(mockGameStats.interactedDoors).toHaveLength(1);
    });

    it('should process item pickup stats', () => {
        const player = mockPlayers[0];
        service.processItemPickupStats(mockGameStats, player, ItemType.Flag);
        expect(mockGameStats.playersWithFlag).toContain(player.playerInfo.userName);

        service.processItemPickupStats(mockGameStats, player, ItemType.BismuthShield);
        const playerStats = mockGameStats.playerStats.get(player.playerInfo.userName);
        expect(playerStats.pickedItems).toContain(ItemType.BismuthShield);
    });

    it('should process attack damage stats', () => {
        const attacker = mockPlayers[0];
        const defender = mockPlayers[1];
        service.processAttackDamageStats(mockGameStats, attacker, defender);

        expect(mockGameStats.playerStats.get(attacker.playerInfo.userName).totalDamageDealt).toEqual(1);
        expect(mockGameStats.playerStats.get(defender.playerInfo.userName).totalHpLost).toEqual(1);
    });

    it('should process successful evade stats', () => {
        const player = mockPlayers[0];
        service.processSuccessfulEvadeStats(mockGameStats, player);

        expect(mockGameStats.playerStats.get(player.playerInfo.userName).evasionCount).toEqual(1);
    });

    it('should process fight end stats', () => {
        const fightResult: FightResult = {
            winner: mockPlayers[0].playerInfo.userName,
            loser: mockPlayers[1].playerInfo.userName,
            respawnPosition: { x: 0, y: 0 },
        };
        service.processFightEndStats(mockGameStats, fightResult, [mockPlayers[0].playerInfo.userName, mockPlayers[1].playerInfo.userName]);

        expect(mockGameStats.playerStats.get(mockPlayers[0].playerInfo.userName).winCount).toEqual(1);
        expect(mockGameStats.playerStats.get(mockPlayers[1].playerInfo.userName).lossCount).toEqual(1);
    });

    it('should process fight end stats on evade', () => {
        const fightResult: FightResult = {
            winner: null,
            loser: null,
            respawnPosition: { x: 0, y: 0 },
        };
        service.processFightEndStats(mockGameStats, fightResult, [mockPlayers[0].playerInfo.userName, mockPlayers[1].playerInfo.userName]);

        expect(mockGameStats.playerStats.get(mockPlayers[0].playerInfo.userName).winCount).toEqual(1);
        expect(mockGameStats.playerStats.get(mockPlayers[1].playerInfo.userName).lossCount).toEqual(1);
    });

    it('should initialize player stats correctly', () => {
        service['initializePlayerStats'](mockGameStats, mockPlayers);
        expect(mockGameStats.playerStats.size).toEqual(mockPlayers.length);
    });

    it('should initialize map stats correctly', () => {
        service['initializeMapStats'](mockGameStats, mockMap, mockPlayers);
        expect(mockGameStats.doorCount).toBeGreaterThan(0);
        expect(mockGameStats.walkableTilesCount).toBeGreaterThan(0);
    });

    it('should calculate door usage percentage correctly', () => {
        mockGameStats.doorCount = 0;
        let percentage = service['computeDoorUsagePercentage'](mockGameStats);
        expect(percentage).toEqual(null);

        mockGameStats.interactedDoors.push({ x: 0, y: 0 });
        mockGameStats.doorCount = 1;
        percentage = service['computeDoorUsagePercentage'](mockGameStats);
        expect(percentage).toEqual(1);
    });

    it('should calculate tile traversal percentage correctly', () => {
        let percentage = service['computeTraversalPercentage'](mockGameStats.visitedTiles, mockGameStats.walkableTilesCount);
        expect(percentage).toBeLessThanOrEqual(1);

        mockGameStats.visitedTiles[0][0] = true;
        percentage = service['computeTraversalPercentage'](mockGameStats.visitedTiles, mockGameStats.walkableTilesCount);
        expect(percentage).toBeLessThanOrEqual(1);
    });
});
