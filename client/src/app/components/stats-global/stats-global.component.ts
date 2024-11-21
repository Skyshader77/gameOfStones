import { Component } from '@angular/core';
import {
    DECIMAL_PRECISION,
    DEFAULT_PLACEHOLDER,
    GLOBAL_STATS_COLUMNS_TEMPLATE,
    GlobalStatsColumnsEnum,
    PERCENTAGE_MULTIPLIER,
} from '@app/constants/game-stats.constants';
import { SECONDS_PER_MINUTE } from '@app/constants/timer.constants';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { GameStatsStateService } from '@app/services/states/game-stats-state/game-stats-state.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { GlobalStatsColumns } from '@common/interfaces/end-statistics';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-global',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './stats-global.component.html',
})
export class StatsGlobalComponent {
    circleInfoIcon = faCircleInfo;
    globalStatsColumns: GlobalStatsColumns[] = [];

    constructor(
        private gameStatsStateService: GameStatsStateService,
        private gameMapService: GameMapService,
    ) {
        this.initializeColumns();
    }

    get gameTime() {
        return this.gameStatsStateService.gameStats?.timeTaken ?? 0;
    }

    get totalTurn() {
        return this.gameStatsStateService.gameStats?.turnCount ?? 0;
    }

    get percentageVisitedTiles() {
        return this.formatPercentage(this.gameStatsStateService.gameStats?.percentageTilesTraversed ?? null);
    }

    get percentageDoorsManipulated() {
        return this.formatPercentage(this.gameStatsStateService.gameStats?.percentageDoorsUsed ?? null);
    }

    get playerWithFlag() {
        return this.gameStatsStateService.gameStats?.numberOfPlayersWithFlag ?? 0;
    }

    get isCTF() {
        return this.gameMapService.map?.mode === GameMode.CTF;
    }

    private get valueResolvers(): Record<GlobalStatsColumnsEnum, () => string> {
        return {
            [GlobalStatsColumnsEnum.Duration]: () => this.getFormattedTime(),
            [GlobalStatsColumnsEnum.TotalTurns]: () => this.totalTurn.toString(),
            [GlobalStatsColumnsEnum.PercentageVisitedTiles]: () => this.percentageVisitedTiles ?? DEFAULT_PLACEHOLDER,
            [GlobalStatsColumnsEnum.DoorsManipulatedPercentage]: () => this.percentageDoorsManipulated ?? DEFAULT_PLACEHOLDER,
            [GlobalStatsColumnsEnum.PlayersWithFlag]: () => (this.isCTF ? this.playerWithFlag.toString() : DEFAULT_PLACEHOLDER),
        };
    }

    private initializeColumns() {
        this.globalStatsColumns = GLOBAL_STATS_COLUMNS_TEMPLATE.map((column) => ({
            ...column,
            value: this.valueResolvers[column.key as GlobalStatsColumnsEnum]?.() ?? DEFAULT_PLACEHOLDER,
        }));
    }

    private getFormattedTime(): string {
        const totalSeconds = this.gameTime;
        const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
        const seconds = totalSeconds - minutes * SECONDS_PER_MINUTE;
        return `${this.padWithZero(minutes)}:${this.padWithZero(seconds)}`;
    }

    private padWithZero(value: number): string {
        return value.toString().padStart(DECIMAL_PRECISION, '0');
    }

    private formatPercentage(value: number | null): string | null {
        return value != null ? (value * PERCENTAGE_MULTIPLIER).toFixed(0) : null;
    }
}
