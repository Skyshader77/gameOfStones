export const PERCENTAGE_MULTIPLIER = 100;
export const DECIMAL_PRECISION = 2;
export const ZERO_THRESHOLD = 10;

export const DEFAULT_PLACEHOLDER = '--';

export enum GlobalStatsColumnsEnum {
    Duration = 'duration',
    TotalTurns = 'totalTurns',
    PercentageVisitedTiles = 'percentageVisitedTiles',
    DoorsManipulatedPercentage = 'doorsManipulatedPercentage',
    PlayersWithFlag = 'playersWithFlag',
}

export const GLOBAL_STATS_COLUMNS_TEMPLATE = [
    {
        key: GlobalStatsColumnsEnum.Duration,
        label: 'Durée de la partie',
        description: 'Durée totale de la partie, formatée en minutes et secondes (MM:SS)',
    },
    {
        key: GlobalStatsColumnsEnum.TotalTurns,
        label: 'Nombre de tours de jeu',
        description: 'Somme des tours de jeu effectués par tous les joueurs',
    },
    {
        key: GlobalStatsColumnsEnum.PercentageVisitedTiles,
        label: 'Pourcentage des tuiles de terrain visitées',
        description: 'Pourcentage des tuiles de terrain ayant été visitées par au moins un joueur durant la partie',
    },
    {
        key: GlobalStatsColumnsEnum.DoorsManipulatedPercentage,
        label: 'Pourcentage des portes ayant été manipulées',
        description: 'Pourcentage des portes ayant été manipulées au moins une fois durant la partie',
    },
    {
        key: GlobalStatsColumnsEnum.PlayersWithFlag,
        label: 'Joueurs ayant détenu le drapeau',
        description: 'Le nombre de joueurs différents ayant détenu le drapeau durant la partie',
        showIf: 'ctfMode',
    },
];

export enum PlayerStatsColumns {
    FightCount = 'fightCount',
    WinCount = 'winCount',
    LossCount = 'lossCount',
    EvasionCount = 'evasionCount',
    TotalHpLost = 'totalHpLost',
    TotalDamageDealt = 'totalDamageDealt',
    ItemCount = 'itemCount',
    PercentageTilesTraversed = 'percentageTilesTraversed',
}

export const PLAYER_STATS_COLUMNS = [
    {
        key: PlayerStatsColumns.FightCount,
        label: 'Combats',
        description: "Indique le nombre total de combats auxquels un joueur a participé, qu'ils soient gagnés ou perdus",
    },
    {
        key: PlayerStatsColumns.WinCount,
        label: 'Victoires',
        description: "Indique le nombre de fois qu'un joueur a remporté un combat",
    },
    {
        key: PlayerStatsColumns.LossCount,
        label: 'Défaites',
        description: "Indique le nombre de fois qu'un joueur a perdu un combat",
    },
    {
        key: PlayerStatsColumns.EvasionCount,
        label: 'Évasions',
        description: "Indique le nombre de fois qu'un joueur a réussi à fuir un affrontement",
    },
    {
        key: PlayerStatsColumns.TotalHpLost,
        label: 'Vie perdue',
        description: 'Indique le nombre total de points de vie perdus par le joueur dans les combats',
    },
    {
        key: PlayerStatsColumns.TotalDamageDealt,
        label: 'Dégâts',
        description: 'Indique le total des dégâts infligés par le joueur à ses adversaires',
    },
    {
        key: PlayerStatsColumns.ItemCount,
        label: 'Objets pris',
        description: "Indique le nombre total d'objets différents collectés par le joueur pendant la partie",
    },
    {
        key: PlayerStatsColumns.PercentageTilesTraversed,
        label: 'Tuiles visitées',
        description: 'Indique le pourcentage des tuiles de terrain visitées par le joueur dans le jeu',
    },
];
