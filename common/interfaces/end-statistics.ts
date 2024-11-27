export interface GameEndStats {
    timeTaken: number;
    turnCount: number;
    percentageDoorsUsed: number | null;
    percentageTilesTraversed: number;
    numberOfPlayersWithFlag: number;
    playerStats: PlayerEndStats[];
}

export interface PlayerEndStats {
    name: string;
    fightCount: number;
    winCount: number;
    lossCount: number;
    evasionCount: number;
    totalHpLost: number;
    totalDamageDealt: number;
    itemCount: number;
    percentageTilesTraversed: number;
}

export interface GlobalStatsColumns {
    key: string;
    label: string;
    description: string;
    value?: string;
    showIf?: string;
}

export interface PlayerStatsColumns {
    key: keyof PlayerEndStats;
    label: string;
    description: string;
}
