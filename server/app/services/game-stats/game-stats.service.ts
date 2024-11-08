import { Injectable } from '@nestjs/common';
import { GameEndStats, PlayerEndStats } from '@common/interfaces/end-statistics';
import { GameStats, PlayerStats } from '@app/interfaces/statistics';
import { MS_TO_S } from '@app/constants/time.constants';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { ItemType } from '@common/enums/item-type.enum';
import { FightResult } from '@common/interfaces/fight';
import { Map as GameMap } from '@app/model/database/map';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

@Injectable()
export class GameStatsService {
    getGameStartStats(map: GameMap, players: Player[]): GameStats {
        const stats = {
            startTime: new Date(),
            turnCount: 0,
            visitedTiles: [],
            interactedDoors: [],
            playersWithFlag: [],
            doorCount: 0,
            walkableTilesCount: 0,
            playerStats: new Map<string, PlayerStats>(),
        };

        this.initializePlayerStats(stats, players);
        this.initializeMapStats(stats, map);

        return stats;
    }

    getGameEndStats(stats: GameStats, players: Player[]): GameEndStats {
        const endStats: GameEndStats = {
            timeTaken: (Date.now() - stats.startTime.getTime()) / MS_TO_S,
            turnCount: stats.turnCount,
            percentageDoorsUsed: this.computeDoorUsagePercentage(stats),
            percentageTilesTraversed: this.computeTraversalPercentage(stats.visitedTiles, stats.walkableTilesCount),
            numberOfPlayersWithFlag: stats.playersWithFlag.length,
            playerStats: this.computePlayerStats(stats, players),
        };
        return endStats;
    }

    processTurnStats(stats: GameStats) {
        stats.turnCount++;
    }

    processMovementStats(stats: GameStats, currentPlayer: Player) {
        const position = currentPlayer.playerInGame.currentPosition;
        stats.visitedTiles[position.y][position.x] = true;
        stats.playerStats.get(currentPlayer.playerInfo.userName).visitedTiles[position.y][position.x] = true;
    }

    processDoorToggleStats(stats: GameStats, doorPosition: Vec2) {
        if (!stats.interactedDoors.includes(doorPosition)) {
            stats.interactedDoors.push(doorPosition);
        }
    }

    // TODO needs to be integrated
    processItemPickupStats(stats: GameStats, player: Player, itemType: ItemType) {
        if (itemType === ItemType.Flag && !stats.playersWithFlag.includes(player.playerInfo.userName)) {
            stats.playersWithFlag.push(player.playerInfo.userName);
        }
        const playerStats = stats.playerStats.get(player.playerInfo.userName);
        if (!playerStats.pickedItems.includes(itemType)) {
            playerStats.pickedItems.push(itemType);
        }
    }

    processAttackDamageStats(stats: GameStats, attacker: Player, defender: Player) {
        stats.playerStats.get(attacker.playerInfo.userName).totalDamageDealt++;
        stats.playerStats.get(defender.playerInfo.userName).totalHpLost++;
    }

    processSuccessfulEvadeStats(stats: GameStats, currentFighter: Player) {
        stats.playerStats.get(currentFighter.playerInfo.userName).evasionCount++;
    }

    processFightEndStats(stats: GameStats, fightResult: FightResult, fighterNames: string[]) {
        const wasEvasion = fightResult.winner === null && fightResult.loser === null;

        const fighter1Stats = stats.playerStats.get(wasEvasion ? fighterNames[0] : fightResult.winner);
        const fighter2Stats = stats.playerStats.get(wasEvasion ? fighterNames[1] : fightResult.winner);

        if (!wasEvasion) {
            fighter1Stats.winCount++;
            fighter2Stats.lossCount++;
        }
        fighter1Stats.fightCount++;
        fighter2Stats.fightCount++;
    }

    private initializePlayerStats(stats: GameStats, players: Player[]) {
        players.forEach((player) => {
            const playerStats: PlayerStats = {
                fightCount: 0,
                winCount: 0,
                lossCount: 0,
                evasionCount: 0,
                totalHpLost: 0,
                totalDamageDealt: 0,
                pickedItems: [],
                visitedTiles: [],
            };
            stats.playerStats.set(player.playerInfo.userName, playerStats);
        });
    }

    private initializeMapStats(stats: GameStats, map: GameMap) {
        let doorCount = 0;
        let walkableTilesCount = 0;

        map.mapArray.forEach((row) => {
            row.forEach((tile) => {
                if (tile === TileTerrain.OpenDoor || tile === TileTerrain.ClosedDoor) {
                    doorCount++;
                }
                if (tile !== TileTerrain.Wall) {
                    walkableTilesCount++;
                }
            });
        });

        stats.doorCount = doorCount;
        stats.walkableTilesCount = walkableTilesCount;
        stats.visitedTiles = Array.from({ length: map.size }, () => Array(map.size).fill(false));
        stats.playerStats.forEach((playerStat) => {
            playerStat.visitedTiles = Array.from({ length: map.size }, () => Array(map.size).fill(false));
        });
    }

    private computeDoorUsagePercentage(stats: GameStats): number {
        return stats.interactedDoors.length / stats.doorCount;
    }

    private computeTraversalPercentage(visitedTiles: boolean[][], walkableTilesCount: number): number {
        let count = 0;
        visitedTiles.forEach((row) =>
            row.forEach((isTileVisited) => {
                count += isTileVisited ? 1 : 0;
            }),
        );
        return count / walkableTilesCount;
    }

    private computePlayerStats(stats: GameStats, players: Player[]): PlayerEndStats[] {
        const endStats: PlayerEndStats[] = [];
        players.forEach((player) => {
            const playerStats = stats.playerStats.get(player.playerInfo.userName);
            endStats.push({
                name: player.playerInfo.userName,
                fightCount: playerStats.fightCount,
                winCount: playerStats.winCount,
                lossCount: playerStats.lossCount,
                evasionCount: playerStats.evasionCount,
                totalHpLost: playerStats.totalHpLost,
                totalDamageDealt: playerStats.totalDamageDealt,
                itemCount: playerStats.pickedItems.length,
                percentageTilesTraversed: this.computeTraversalPercentage(playerStats.visitedTiles, stats.walkableTilesCount),
            });
        });

        return endStats;
    }
}
