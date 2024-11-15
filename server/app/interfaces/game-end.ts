import { GameEndStats } from '@common/interfaces/end-statistics';

export interface GameEndOutput {
    hasEnded: boolean;
    winnerName: string | null;
    endStats: GameEndStats | null;
}
