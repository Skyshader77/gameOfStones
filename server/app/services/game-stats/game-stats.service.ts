import { Injectable } from '@nestjs/common';
import { GameEndStats, PlayerEndStats } from '@common/interfaces/end-statistics';
import { GameStats } from '@app/interfaces/statistics';
import { MS_TO_S } from '@app/constants/time.constants';

@Injectable()
export class GameStatsService {
    getGameEndStats(stats: GameStats): GameEndStats {
        const endStats: GameEndStats = {
            timeTaken: (Date.now() - stats.startTime.getTime()) / MS_TO_S,
            turnCount: stats.turnCount,
            percentageDoorsUsed: this.computeDoorUsagePercentage(), // TODO
            percentageTilesTraversed: this.computeTraversalPercentage(), // TODO
            numberOfPlayersWithFlag: stats.numberOfPlayersWithFlag,
            playerStats: this.computePlayerStats(), // TODO
        };
        return endStats;
    }

    processTurnStats() {}

    processMovementStats() {}
    processDoorStats() {}
    processItemPickupStats() {}

    processAttackStats() {}
    processEvadeStats() {}
    processFightEndStats() {}

    private computeDoorUsagePercentage(): number {
        return 0;
    }

    private computeTraversalPercentage(): number {
        return 0;
    }

    private computePlayerStats(): PlayerEndStats[] {
        return [];
    }
}
